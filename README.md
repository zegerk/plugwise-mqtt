![Node.js CI](https://github.com/zegerk/plugwise-mqtt/workflows/Node.js%20CI/badge.svg?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/zegerk/plugwise-mqtt/badge.svg)](https://snyk.io/test/github/zegerk/plugwise-mqtt)
[![Maintainability](https://api.codeclimate.com/v1/badges/da81856a8a53a198b4bb/maintainability)](https://codeclimate.com/github/zegerk/plugwise-mqtt/maintainability)

# plugwise-mqtt

Bridge between Plugwise Adam and a MQTT server

The bridge was build to control Plugwise Anna thermostats with Google Home through gBridge but can also be used with other MQTT based 
tools and services.

The bridge can also export all data from the Plugwise Adam and the attached Toms and Lisas in order to create nice dashboards and graphs; this has been tested using Thingsboard and the Thingsboard IoT gateway.

Note the bridge only supports setting the thermostat temperature, not other features of the Plugwise appliances are currently available. 

## Features

* Set the temperature of Lisa thermostats through MQTT topic(s)
* Publish all appliance data (Toms, Lisas and the Gateway) to MQTT on a regular interval
* The status of the bridge is published at regular intervals to status topic(s)

## Setup and run

```
npm install 
npm run build
npm start
```

A config.yml is required or environment parameters must be set, example:

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
  pollInterval: 10000
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

References

Error handling based on : https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-driven-design-70726e061c86
