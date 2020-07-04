# plugwise-mqtt

Bridge between Plugwise Adam and a MQTT server

The bridge was build to control Plugwise Anna thermostats with Google Home through gBridge but can also be used with other MQTT based 
tools and services.

The bridge can also export all data from the Plugwise Adam and the attached Toms and Annas in order to create nice dashboards and graphs; this has been tested using Thingsboard and the Thingsboard IoT gateway.

## Features

* Set the temperature of Anna thermostats through MQTT topic(s)
* Publish all appliance data (Toms, Annas and the Gateway) to MQTT on a regular interval
* The status of the bridge is published at regular intervals to status topic(s)

## Setup

```
npm run build
```

Example config.yml

```yaml
logLevel: info
# If set to false the bridge will only handle actions but will 
# not request updates from the Plugwise gateway at regular intervals
plugwiseUpdate: true
plugwise:
  # mdns or ip here
  baseUrl: 'http://smilexxxxxx.local/'
  # should be smile for all Plugwise Adam gateways
  username: 'smile'
  # on the back of the Plugwise Adam the password is shown
  password: 'xxxxxxxxxxx'
  # how often to pull updates from the Plugwise Adam in ms
  pullPause: 10000
mqtt:
    # If set to true messages will be shown in the log but
    # not send to the MQTT servera
    dryRun: true
    # mdns or IP here
    server: 'mqtt://xxxxxxxx.local'
    # usually 1883
    port: 1883
    topics:
      # status updates from the bridge will be send to these
      # topics
      status:
        default:
          topic: 'plugwiseBridge/status'
      # Plugwise Adam updates will be send to these topics
      # available keywords in the template - example is showing
      # gbridge based setup and a setup where all data is published
      # in a json string
      data:
        gBridge:
          topic: 'gBridge/u1/{applianceId}/{fieldName}/set'
          message: '{fieldValue}'
        default:
          topic: '/sensor/plugwise/{applianceId}/data'
          message: 'complete'
      # The bridge listens to these topics for upates, currently
      # configured for setting the scene (on/off) and the thermostat
      # value, if the update is successful the new status (temperature or
      # scene) will be set in the satus topic, this allows checking
      # if value has been set; Google Home requires this
      #
      # Example is showing gbridge based setup
      action:
        gbridge:
          thermostat: 
            listen: 'gBridge/u1/{applianceId}/thermostat'
            status: 'gBridge/u1/{applianceId}/thermostat/set'
          scene:
            listen: 'gBridge/u1/{applianceId}/scene'
            status: 'gBridge/u1/{applianceId}/scene/set'

```


## Legal

This tool is NOT affiliated to Plugwise.
