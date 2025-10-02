import { supabase } from '@/lib/supabase'
import { Employee, Procedure, CalendarEvent, PotentialEvent } from '@/types/taimeline'

// Employee API functions
export const employeeApi = {
  async getAll(businessId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },

  async create(
    businessId: string,
    employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({ ...employee, business_id: businessId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('employees').update({ is_active: false }).eq('id', id)

    if (error) throw error
  }
}

// Procedure API functions
export const procedureApi = {
  async getAll(businessId: string): Promise<Procedure[]> {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },

  async create(
    businessId: string,
    procedure: Omit<Procedure, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Procedure> {
    const { data, error } = await supabase
      .from('procedures')
      .insert({ ...procedure, business_id: businessId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Procedure>): Promise<Procedure> {
    const { data, error } = await supabase
      .from('procedures')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('procedures').update({ is_active: false }).eq('id', id)

    if (error) throw error
  }
}

// Calendar Event API functions
export const eventApi = {
  async getByDateRange(
    businessId: string,
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<CalendarEvent[]> {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('business_id', businessId)
      .gte('start_datetime', startDate.toISOString())
      .lte('end_datetime', endDate.toISOString())
      .order('start_datetime')

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async create(
    businessId: string,
    event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({ ...event, business_id: businessId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id)

    if (error) throw error
  }
}

// Potential Event API functions
export const potentialEventApi = {
  async getAll(businessId: string): Promise<PotentialEvent[]> {
    const { data, error } = await supabase
      .from('potential_events')
      .select('*')
      .eq('business_id', businessId)
      .in('status', ['pending_selection', 'awaiting_approval'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async approve(id: string): Promise<void> {
    const { error } = await supabase
      .from('potential_events')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) throw error
  },

  async reject(id: string): Promise<void> {
    const { error } = await supabase
      .from('potential_events')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) throw error
  }
}

// Availability checking functions
export const availabilityApi = {
  async checkAvailability(
    businessId: string,
    employeeId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    // Check for conflicting events
    const { data: conflictingEvents, error } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('business_id', businessId)
      .eq('employee_id', employeeId)
      .neq('status', 'cancelled')
      .or(
        `and(start_datetime.lte.${endTime.toISOString()},end_datetime.gte.${startTime.toISOString()})`
      )

    if (error) throw error

    return !conflictingEvents || conflictingEvents.length === 0
  },

  async findAvailableSlots(
    businessId: string,
    procedureId: string,
    preferredDate?: Date,
    daysAhead: number = 14
  ): Promise<
    { employee_id: string; employee_name: string; start_datetime: string; end_datetime: string }[]
  > {
    // This is a simplified version - in reality, you'd implement more complex availability logic
    // considering employee work schedules, existing appointments, etc.

    const employees = await employeeApi.getAll(businessId)
    const procedures = await procedureApi.getAll(businessId)
    const procedure = procedures.find((p) => p.id === procedureId)

    if (!procedure) return []

    const availableSlots = []
    const startDate = preferredDate || new Date()

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const checkDate = new Date(startDate)
      checkDate.setDate(startDate.getDate() + dayOffset)

      for (const employee of employees.filter((e) => procedure.employee_ids.includes(e.id))) {
        const dayName = checkDate
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase() as keyof typeof employee.work_schedule
        const workSlots = employee.work_schedule[dayName] || []

        for (const workSlot of workSlots) {
          const slotStart = new Date(checkDate)
          const [startHour, startMinute] = workSlot.start.split(':').map(Number)
          slotStart.setHours(startHour, startMinute, 0, 0)

          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotEnd.getMinutes() + procedure.duration_minutes)

          const isAvailable = await availabilityApi.checkAvailability(
            businessId,
            employee.id,
            slotStart,
            slotEnd
          )

          if (isAvailable) {
            availableSlots.push({
              employee_id: employee.id,
              employee_name: employee.name,
              start_datetime: slotStart.toISOString(),
              end_datetime: slotEnd.toISOString()
            })
          }
        }
      }
    }

    return availableSlots.slice(0, 10) // Return first 10 available slots
  }
}
