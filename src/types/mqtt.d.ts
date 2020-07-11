import {ExtError} from '../lib/error'

export interface statusMqttMessage {
  // ISO-8601 timestamp of last update
  updateTime?: string
  // Number of updates
  updateCount?: number
  // Last error
  err?: string | ExtError
}

export interface plugwiseMqttMessage {
  // Timestamp in ms
  ts: number
  // appliance ID [a-z0-9]{16}
  id: string
  // human readable device name, "Kitchen thermostat"
  name: string
  // Plugwise device type, "zone_thermostat"
  type: string
  // Name of the datafield (key)
  fieldName: string
  // Value of the field (value)
  fieldValue: string | number
  // key -> value
  [index: string]: string | number
}
