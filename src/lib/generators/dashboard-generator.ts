import simpleGit from 'simple-git'
import fs from 'fs/promises'
import path from 'path'

interface GenerationOptions {
  businessName: string
  ownerEmail: string
  brandColors: {
    primary: string
    secondary: string
    accent: string
  }
  logoUrl?: string
  enabledServices: ('taimeline' | 'derlivery')[]
  giteaConfig: {
    baseUrl: string
    token: string
    orgName?: string
  }
}

export class DashboardGenerator {
  private templatePath: string
  private outputPath: string

  constructor() {
    this.templatePath = path.join(process.cwd(), 'templates', 'dashboard-base')
    this.outputPath = path.join(process.cwd(), 'generated')
  }

  async generateDashboard(options: GenerationOptions): Promise<string> {
    const projectSlug = this.slugify(options.businessName)
    const projectPath = path.join(this.outputPath, projectSlug)

    try {
      // 1. Copy base template
      await this.copyTemplate(projectPath)

      // 2. Apply customizations
      await this.applyBrandColors(projectPath, options.brandColors)
      await this.configureServices(projectPath, options.enabledServices)
      await this.updatePackageJson(projectPath, options.businessName)
      await this.generateEnvFile(projectPath, options)

      // 3. Create Git repository
      const git = simpleGit(projectPath)
      await git.init()
      await git.add('.')
      await git.commit('Initial dashboard setup')

      // 4. Push to Gitea (if configured)
      if (options.giteaConfig) {
        const repoUrl = await this.createGiteaRepo(projectSlug, options)
        await git.addRemote('origin', repoUrl)
        await git.push('origin', 'main')
        return repoUrl
      }

      return projectPath
    } catch (error) {
      console.error('Generation failed:', error)
      throw error
    }
  }

  private async copyTemplate(targetPath: string) {
    // Copy template files (implementation depends on your template structure)
    await fs.mkdir(targetPath, { recursive: true })
    // TODO: Implement template copying logic
  }

  private async applyBrandColors(projectPath: string, colors: GenerationOptions['brandColors']) {
    const cssPath = path.join(projectPath, 'src', 'app', 'globals.css')

    // Read and modify CSS variables
    const cssContent = await fs.readFile(cssPath, 'utf-8')
    const updatedCss = cssContent
      .replace(/--primary: [^;]+;/, `--primary: ${colors.primary};`)
      .replace(/--secondary: [^;]+;/, `--secondary: ${colors.secondary};`)
      .replace(/--accent: [^;]+;/, `--accent: ${colors.accent};`)

    await fs.writeFile(cssPath, updatedCss)
  }

  private async configureServices(projectPath: string, services: string[]) {
    const configPath = path.join(projectPath, 'src', 'config', 'services.ts')
    const serviceConfig = `export const enabledServices = ${JSON.stringify(services)};`
    await fs.writeFile(configPath, serviceConfig)
  }

  private async updatePackageJson(projectPath: string, businessName: string) {
    const packagePath = path.join(projectPath, 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'))

    packageJson.name = this.slugify(businessName) + '-dashboard'
    packageJson.description = `Dashboard for ${businessName}`

    await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2))
  }

  private async generateEnvFile(projectPath: string, options: GenerationOptions) {
    const envPath = path.join(projectPath, '.env.local')
    const envContent = `# Generated for ${options.businessName}
NEXT_PUBLIC_BUSINESS_NAME="${options.businessName}"
NEXT_PUBLIC_OWNER_EMAIL="${options.ownerEmail}"
NEXT_PUBLIC_BRAND_PRIMARY="${options.brandColors.primary}"
NEXT_PUBLIC_BRAND_SECONDARY="${options.brandColors.secondary}"
NEXT_PUBLIC_BRAND_ACCENT="${options.brandColors.accent}"
${options.logoUrl ? `NEXT_PUBLIC_LOGO_URL="${options.logoUrl}"` : ''}

# Add your Supabase keys here
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
`
    await fs.writeFile(envPath, envContent)
  }

  private async createGiteaRepo(name: string, options: GenerationOptions): Promise<string> {
    // TODO: Implement Gitea API integration
    const repoName = this.slugify(options.businessName) + '-dashboard'
    const giteaUrl = `${options.giteaConfig.baseUrl}/${
      options.giteaConfig.orgName || 'dashboards'
    }/${repoName}`
    return giteaUrl
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}
