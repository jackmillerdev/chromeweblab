# 
#  max.py: send OSC messages to be converted to MIDI messages for robots
#  
#    Copyright 2013 Google Inc
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

import json
from twisted.application import internet, service
from txosc import osc, dispatch, async
import messenger
import notes
import time

# This is a stub for users that do not have Max or are not running on mac.
# It needs to send a "/loop" OSC command every loop so that the client can sync.
# Normally this is done by Max, but we set up a timmer and do it manually here.

# CLIENT
# 
osc_send_address = None
client = None

def send_instruments():
    """
    Send all instrument note positions to Max
    """
    send("/instruments " + json.dumps(notes.instruments))

def send(message):
    """
    Send message to Max.
    OSC message is path + arguments in one string.
    """
    global client
    print "SEND: %s" % message
    client.send(osc.Message(message), osc_send_address)

def client_service(address):
    """
    Twisted service for outbound OSC messages.
    (Weirdly, Twisted has us call UDPServer() to register a client. [sic])
    """
    global client, osc_send_address
    osc_send_address = address
    client = async.DatagramClientProtocol()
    return internet.UDPServer(0, client)


# SERVER
# 

def got_loop():
    """
    Max passed a timestamp from last loop start.
    Get next n loop_times, send to WS.
    """
    global client
    loop_time = int(round(time.time() * 1000))
    notes.step_ms = 250 
    loop_times = notes.next_loop_times(loop_time)
    messenger.websocketclient.broadcast_loop_times(loop_times)

def server_service(port):
    """
    Create Twisted service for OSC server ('receiver').
    Callbacks for inbound messages must be registered here.
    """
    
    return internet.TimerService(4, got_loop)
