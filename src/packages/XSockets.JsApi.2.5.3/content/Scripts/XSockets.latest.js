/*
* XSockets.NET XSockets.latest
* http://xsockets.net/
* Distributed in whole under the terms of the MIT
 
*
* Copyright 2013, Magnus Thor & Ulf Björklund
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
 
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
 
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/
var Subscriptions = (function () {
    /// <summary>
    ///     Module to handle subscriptions (add,get,remove) and all its callbacks.
    /// </summary>           
    var subscriptions = [];
    this.add = function (name, fn, opt) {
        /// <summary>
        ///     if a subscription with the same name exists the function will be
        ///     added to the callback list.
        ///     if the subscription does not exist a new one will be created.
        ///     
        ///     Returns the index of the callback added to be used if you only want to remove a specific callback.
        /// </summary>
        /// <param name="name" type="string">
        ///    Name of the subscription.
        /// </param>
        /// <param name="fn" type="function">
        ///    The callback function to add
        /// </param>
        name = name.toLowerCase();
        var storedSub = this.get(name);
        if (storedSub === null) {
            var sub = new subscription(name);
            sub.addCallback(fn, opt);
            subscriptions.push(sub);
            return 1;
        }
        storedSub.addCallback(fn, opt);
        return storedSub.Callbacks.length;
    };
    this.get = function (name) {


        /// <summary>
        ///     Returns the subscription and all its callbacks.
        ///     if not found null is returned.
        /// </summary>
        /// <param name="name" type="string">
        ///    Name of the subscription.
        /// </param> 
        if (typeof (name) === "undefined") return;
        name = name.toLowerCase();
        for (var i = 0; i < subscriptions.length; i++) {
            if (subscriptions[i].Name === name) return subscriptions[i];
        }
        return null;
    };
    this.getAll = function () {
        /// <summary>
        ///     Returns all the subscriptions.        
        /// </summary>
        return subscriptions;
    };
    this.remove = function (name, ix) {
        /// <summary>
        ///     Removes a subscription with the matching name.
        ///     if ix of a callback is passed only the specific callback will be removed.
        ///     
        ///     Returns true if something was removed, false if nothing was removed.
        /// </summary>
        /// <param name="name" type="string">
        ///    Name of the subscription.
        /// </param>
        /// <param name="ix" type="number">
        ///    The index of the callback to remove (optional)
        /// </param>
        name = name.toLowerCase();
        for (var i = 0; i < subscriptions.length; i++) {
            if (subscriptions[i].Name === name) {
                if (ix === undefined) {
                    subscriptions.splice(i, 1);
                } else {
                    subscriptions[i].Callbacks.splice(ix - 1, 1);
                    if (subscriptions[i].Callbacks.length === 0) subscriptions.splice(i, 1);
                }
                return true;
            }
        }
        return false;
    };
    this.fire = function (name, message, cb, ix) {
        /// <summary>
        ///     Triggers all callbacks on the subscription, or if ix is set only that callback will be fired.
        /// </summary>
        /// <param name="name" type="string">
        ///    Name of the subscription.
        /// </param>
        /// <param name="ix" type="number">
        ///    The index of the callback to trigger (optional)
        /// </param>
        if (typeof (name) === "undefined") return;
        name = name.toLowerCase();
        for (var i = 0; i < subscriptions.length; i++) {
            if (subscriptions[i].Name === name) {
                if (ix === undefined) {
                    subscriptions[i].fireCallbacks(message, cb);
                } else {

                    subscriptions[i].fireCallback(message, cb, ix);
                }
            }
        }
    };
    var subscription = function (name) {
        this.Name = name;
        this.Callbacks = [];
        this.addCallback = function (fn, opt) {
            this.Callbacks.push(new callback(name, fn, opt));
        };
        this.fireCallback = function (message, cb, ix) {
            this.Callbacks[ix - 1].fn(message);

            if (typeof (this.Callbacks[ix - 1].state) === "object") {
                if (typeof (this.Callbacks[ix - 1].state.options) !== "undefined" && typeof (this.Callbacks[ix - 1].state.options.counter) !== "undefined") {
                    this.Callbacks[ix - 1].state.options.counter.messages--;
                    if (this.Callbacks[ix - 1].state.options.counter.messages === 0) {
                        if (typeof (this.Callbacks[ix - 1].state.options.counter.completed) === 'function') {
                            this.Callbacks[ix - 1].state.options.counter.completed();
                        }
                    }
                }
            }
            if (cb && typeof (cb) === "function") {
                cb(this.Callbacks[ix - 1].name);
            }
        };

        this.fireCallbacks = function (message, cb) {

            for (var c = 0; c < this.Callbacks.length; c++) {
                this.fireCallback(message, cb, c + 1);
            }
        };
    };
    var callback = function (name, func, opt) {
        this.name = name;
        this.fn = func;
        this.state = opt;
    };
    return this;
});
(function () {
    "use strict";
    var jXSockets = {
        Delay: 20,
        Events: {
            onError: "xsockets.onerror",
            open: "xsockets.xnode.open",
            close: "close",
            storage: {
                set: "xsockets.storage.set",
                get: "xsockets.storage.get",
                getAll: "xsockets.storage.getall",
                remove: "xsockets.storage.remove"
            },
            serverstatus: {
                status: "xsockets.server.status"
            },
            onBlob: "blob",
            connection: {
                getallclients: "xsockets.getallclients",
                onclientconnect: "xsockets.onclientconnect",
                onclientdisconnect: "xsockets.onclientdisconnect",
                disconnect: "xsockets.disconnect"
            }
        },
        Utils: {
            getParameterByName: function (name) {
                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                var regexS = "[\\?&]" + name + "=([^&#]*)";
                var regex = new RegExp(regexS);
                var results = regex.exec(window.location.search);
                if (results == null)
                    return "";
                else
                    return decodeURIComponent(results[1].replace(/\+/g, " "));
            },
            extend: function (obj, extObj) {
                if (arguments.length > 2) {
                    for (var a = 1; a < arguments.length; a++) {
                        extend(obj, arguments[a]);
                    }
                } else {
                    for (var i in extObj) {
                        obj[i] = extObj[i];
                    }
                }
                return obj;
            },
            guid: function (a, b) {
                for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
                return b;
            }
        },
        WebSocket: function (url, subprotocol, settings) {
            /// <summary>
            /// XSockets.NET JavaScript API 
            /// </summary>
            ///<param name="url" type="String">
            /// The WebSocket handler (URL) to connect to. i.e ws://127.0.0.1:4502/GenericText
            ///</param>
            ///<param name="subprotocol" type="String">
            /// Subprotocol i.e GenericText 
            ///</param>          
            var webSocket = null;
            var self = this;

            var subscriptions = new Subscriptions();

            var options = XSockets.Utils.extend({
                apikey: null,
                parameters: {},
                binaryType: "arraybuffer"
            }, settings);

            this.connection = {};
            
            if (subprotocol === undefined) {
                if (url.indexOf('?') === -1) {
                    subprotocol = url.substring(url.lastIndexOf('/') + 1);
                } else {
                    var temp = url.substring(0, url.indexOf('?'));
                    subprotocol = temp.substring(temp.lastIndexOf('/') + 1);
                }
            }            
            this.handler = subprotocol;
            this.channel = {};

            var pubSub = {
                subscribe: "xsockets.subscribe",
                unsubscribe: "xsockets.unsubscribe",
                getSubscriptions: "xsockets.getsubscriptions",
                getAllSubscriptions: "xsockets.getallsubscriptions"
            };
            var parameters = function (p) {
                var str = "?";
                for (var key in p) {
                    str += key + '=' + encodeURIComponent(p[key]) + '&';
                }
                str = str.slice(0, str.length - 1);
                return str;
            };
            
            var dispatch = function (eventName, message) {
                if (subscriptions.get(eventName) === null) {
                    return;
                }
                if (typeof message === "string") {
                    message = JSON.parse(message);
                }
                subscriptions.fire(eventName, message, function (evt) {
                });
            };
            var getClientType = function() {
                if (typeof (window.WebSocket.CLOSED )  === "undefined") return "Fallback";
                return "WebSocket" in window && WebSocket.CLOSED > 2 ? "RFC6455" : "Hixie";
            };

            this.close = function (fn) {
                /// <summary>
                ///     Close the current XSocket WebSocket instance and the underlaying WebSocket. Server will fire the XSockets.Event.close event
                //      Just add a subscription i.e ws.bind(XSockets.Event.close,function(){  });
                /// </summary>
                /// <param name="fn" type="function">
                ///    A function to execute when closed.
                /// </param>   
                this.trigger(XSockets.Events.connection.disconnect, {}, fn);
                //dispatch("close", {});
                // webSocket.close();
                //if (typeof fn === "function") fn();
            };
            this.getSubscriptions = function () {
                /// <summary>
                ///     Get all subscriptions for the current Handler
                /// </summary>
                return subscriptions.getAll();
            };
            this.bind = function (event, fn, opts, callback) {
                /// <summary>
                ///     Establish a subscription on the XSocketsController connected.
                /// </summary>
                /// <param name="event" type="string">
                ///    Name unique name of the subscription (event)
                /// </param> 
                /// <param name="fn" type="function">
                ///    A function to execute each time the event (subscription) is triggered.
                /// </param>   
                /// <param name="options" type="object">
                ///   Options, connsult the documentation
                /// </param>
                /// <param name="callback" type="function">
                ///    A function to execute when completed, if provided the server will pass a confirm message when subscriptions is established
                /// </param>
                var o = {
                    options: !(opts instanceof Function) ? opts : {},
                    ready: webSocket.readyState,
                    confirm: (callback || opts) instanceof Function
                };
                if (o.ready === 1) {
                    self.trigger(new XSockets.Message(pubSub.subscribe, {
                        Event: event,
                        Confirm: o.confirm
                    }));
                }
                if (fn instanceof Function) {
                    subscriptions.add(event, fn, o);
                } else if (fn instanceof Array) {
                    fn.forEach(function (cb) {
                        subscriptions.add(event, cb, o);
                    });
                }
                if (typeof (callback) === "function" || typeof (opts) === "function") 
                    subscriptions.add("__" + event, callback || opts, { options: { ready: 2 } });
                return this;
            };
       
            this.many = function (event, count, fn, opts,callback) {
                /// <summary>
                ///    Establish a subscription on the XSocketsController connected.  unbinds when the subscriptions callback has fired specified number of (count) times.
                /// </summary>
                /// <param name="event" type="String">
                ///    Name of the event (subscription)
                /// </param>           
                /// <param name="count" type="Number">
                ///     Number of times to listen to this event (subscription)
                /// </param>           
                /// <param name="fn" type="Function">
                ///    A function to execute at the time the event is triggered the specified number of times.
                /// </param> 
                /// <param name="options" type="object">
                ///   event (subscriptions) options
                /// </param>
                /// <param name="callback" type="function">
                ///    A function to execute when completed, if provided the server will pass a confirm message when subscriptions is established
                /// </param>
                self.bind(event, fn, XSockets.Utils.extend({
                    counter: {
                        messages: count,
                        completed: function () {
                            self.unbind(event);
                        }
                    }
                }, opts), callback || opts);
                return this;
            };
            this.one = function (event, fn, opts,callback) {
                /// <summary>
                ///    Establish a subscription on the XSocketsController connected.  unbinds when the subscriptions callback has fired once (1)
                /// </summary>
                /// <param name="event" type="String">
                ///    Name of the event (subscription)
                /// </param>           
                /// <param name="fn" type="Function">
                ///    A function to trigger when executed once.
                /// </param>       
                /// <param name="options" type="object">
                ///   event (subscriptions) options
                /// </param>  
                self.bind(event, fn, XSockets.Utils.extend({
                    counter: {
                        messages: 1,
                        completed: function () {
                            self.unbind(event);
                        }
                    }
                }, opts), callback || opts);
                return this;
            };
            this.unbind = function (event, callback) {
                /// <summary>
                ///     Remove a subscription for the current client on the connected XSocketsController
                /// </summary>
                /// <param name="event" type="String">
                ///    Name of the event (subscription) to unbind.
                /// </param>           
                /// <param name="callback" type="function">
                ///    A function to execute when completed.
                /// </param>   
                if (subscriptions.remove(event)) {
                    self.trigger(new XSockets.Message(pubSub.unsubscribe, {
                        Event: event
                    }));
                }
                if (callback && typeof (callback) === "function") {
                    callback();
                }
                return this;
            };
            this.trigger = function (event, json, callback) {
                /// <summary>
                ///      Trigger (Publish) a WebSocketMessage (event) to the current WebSocket Handler.
                /// </summary>
                /// <param name="event" type="string">
                ///     Name of the event (publish) 
                /// </param>                
                /// <param name="json" type="JSON">
                ///     JSON representation of the WebSocketMessage to trigger/send (publish)
                /// </param>
                /// <param name="callback" type="function">
                ///      A function to execute when completed. 
                /// </param>
                if (typeof (event) !== "object") {
                    if (arguments.length !== 2 || typeof (json) !== "function") {
                        if (arguments.length === 1) {
                            json = {};
                        }
                    } else {
                        callback = json;
                        json = {};
                    }
                }


                if (typeof (event) !== "object") {
                    event = event.toLowerCase();
                    var message = new XSockets.Message(event, json);
                    webSocket.send(message.toString());
                    if (callback && typeof (callback) === "function") {
                        callback();
                    }
                } else {
                    webSocket.send(event.toString());
                    if (json && typeof (json) === "function") {
                        json();
                    }
                }

                return this;
            };
            this.send = function (payload) {
                /// <summary>
                ///     Send a message
                /// </summary>
                /// <param name="payload" type="object">
                ///     string / blob to send
                /// </param> 
                webSocket.send(payload);
            };

            if ('WebSocket' in window) {
                if (getClientType() === "Fallback") {
                    webSocket = new window.WebSocket(url, subprotocol);
                } else {

                    var storageGuid = window.localStorage.getItem("XSocketsClientStorageGuid" + subprotocol) !== null ?
                        window.localStorage.getItem("XSocketsClientStorageGuid" + subprotocol) : null;
                        if (storageGuid !== null) {
                            options.parameters["XSocketsClientStorageGuid"] = storageGuid;
                    }
                url = url + parameters(options.parameters);
                webSocket = new window.WebSocket(url, subprotocol);
                webSocket.binaryType = options.binaryType;
                }
            }
            


            if (webSocket !== null) {
                self.bind(jXSockets.Events.open, function (data) {
                    self.connection = data;
                    
                    window.localStorage.setItem("XSocketsClientStorageGuid" + subprotocol, data.StorageGuid);
                    

                    var chain = subscriptions.getAll();
                    for (var e = 0; e < chain.length; e++) {
                        for (var c = 0; c < chain[e].Callbacks.length; c++) {
                            if (chain[e].Callbacks[c].state.ready === 0) {
                                self.trigger(new XSockets.Message(pubSub.subscribe, {
                                    Event: chain[e].Name,
                                    Confirm:  chain[e].Callbacks[c].state.confirm
                                }));
                            }
                        }
                    }
                }, {
                    subscribe: false
                });
                webSocket.onclose = function (msg) {
                    dispatch('close', msg);
                };
                webSocket.onopen = function (msg) {
                    dispatch('open', msg);
                };
                webSocket.onmessage = function (message) {
                    if (typeof message.data === "string") {
                        var msg = JSON.parse(message.data);
                        dispatch(msg.event, msg.data);
                    } else {
                        dispatch(XSockets.Events.onBlob, message.data);
                    }
                };
            }
            return {
                close: self.close,
                bind: self.bind,
                unbind: self.unbind,
                one: self.one,
                many: self.many,
                on: self.bind,
                off: self.unbind,
                trigger: self.trigger,
                triggerBinary: self.send,
                send: self.send,
                channel: self.channel,
                subscribe: self.bind,
                unsubscribe: self.unbind,
                publish: self.trigger,
                emit: self.trigger,
                subscriptions: self.getSubscriptions,
                clientType: getClientType()
            };
        },
        Channel: function () {
            var create = function (url, handler, settings) {
                /// <summary>
                ///      Create a new Channel (Private connection to the specified handler)
                /// </summary>
                /// <param name="url" type="string">
                ///     WebSocket URL
                /// </param>                
                /// <param name="handler" type="string">
                ///     The handler/controller to connect to 
                /// </param>
                /// <param name="settings" type="object">
                ///     settings / options (parameters etc)
                /// </param>
                var id = jXSockets.Utils.guid();
                var channelUrl = url + "/" + id;
                var ws = new XSockets.WebSocket(channelUrl, handler, settings);
                ws.channel = {
                    Id: id,
                    args: [channelUrl, handler, settings]
                };
                return ws;
            };
            var connect = function (channel) {
                /// <summary>
                ///      Connect to a channel 
                /// </summary>
                /// <param name="channel" type="object">
                ///     Channel to connect to
                /// </param>                
                return new XSockets.WebSocket(channel.args[0], channel.args[1], channel.args[2]);
            };
            return {
                Create: create,
                Connect: connect
            };
        }(),
        Message: function (event, object) {
            /// <summary>
            ///     Create a new XSockets Message
            /// </summary>
            /// <param name="event" type="string">
            ///     Name of the event
            /// </param>             
            /// <param name="object" type="object">
            ///     The message payload (JSON)
            /// </param>  
            var json = {
                event: event,
                data: JSON.stringify(object)
            };
            this.JSON = function () {
                return json;
            }();
            this.toString = function () {
                return JSON.stringify(json);
            };
            return this;
        }
    };
    if (!window.jXSockets) {
        window.jXSockets = jXSockets;
    }
    if (!window.XSockets) {
        window.XSockets = jXSockets;
    }
})();