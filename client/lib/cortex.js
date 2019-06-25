/*
 * JS Cortex Wrapper
 * *****************
 *
 * This library is intended to make working with Cortex easier in Javascript.
 *
 * It makes extensive use of Promises for flow control; all requests return a
 * Promise with their result. 
 * 
 * For the subscription types in Cortex, we use an event emitter. Each kind of
 * event (mot, eeg, etc) is emitted as its own event that you can listen for
 * whether or not there are any active subscriptions at the time.
 *
 * The API methods are defined by using Cortex's inspectApi call. We mostly
 * just pass information back and forth without doing much with it, with the
 * exception of the login/auth flow, which we expose as the init() method.
 */

(function () {
  if (this["Cortex"]) {
    console.warn("Cortex is already initialized");
    return;
  }

  const CORTEX_URL = "wss://localhost:6868";

  const safeParse = msg => {
    try {
      return JSON.parse(msg);
    } catch (_) {
      return null;
    }
  };

  class JSONRPCError extends Error {
    constructor(err) {
      super(err.message);
      this.name = this.constructor.name;
      this.message = err.message;
      this.code = err.code;
    }
    toString() {
      return `${super.toString()} (${this.code})`;
    }
  }

  class Cortex extends EventTarget {
    constructor(options = {}) {
      super();
      this.options = options;
      this.ws = new WebSocket(CORTEX_URL);
      this.msgId = 0;
      this.requests = {};
      this.listeners = {};
      this.uniqueEvents = {};
      this.ws.addEventListener("message", this._onmsg.bind(this));
      this.ws.addEventListener("close", () => {
        this._log("ws: Socket closed");
      });
      this.verbose = options.verbose !== null ? options.verbose : 1;
      this.handleError = error => {
        throw new JSONRPCError(error);
      };
      
      this.ready = new Promise(
        resolve => this.ws.addEventListener("open", resolve),
        this.handleError
      )
        .then(() => this._log("ws: Socket opened"))
        .then(() => this.call("inspectApi"))
        .then(methods => {
          for (const m of methods) this.defineMethod(m.methodName, m.params);
          this._log(`rpc: Added ${methods.length} methods from inspectApi`);
        })
        .then(() => this.emit("ready"));
    }
    _onmsg(msg) {
      const data = safeParse(msg.data);
      if (!data) return this._warn("unparseable message", msg);

      this._debug("ws: <-", msg.data);

      if ("id" in data) {
        const id = data.id;
        this._log(
          `[${id}] <-`,
          data.result ? "success" : `error (${data.error.message})`
        );
        if (this.requests[id]) {
          this.requests[id](data.error, data.result);
        } else {
          this._warn("rpc: Got response for unknown id", id);
        }
      } else if ("sid" in data) {
        const dataKeys = Object.keys(data).filter(
          k => k !== "sid" && k !== "time" && Array.isArray(data[k])
        );
        for (const k of dataKeys) {
          this.emit(k, data) || this._warn("no listeners for stream event", k);
        }
      } else {
        this._log("rpc: Unrecognised data", data);
      }
    }
    _warn(...msg) {
      if (this.verbose > 0) console.warn("[Cortex WARN]", ...msg);
    }
    _log(...msg) {
      if (this.verbose > 1) console.warn("[Cortex LOG]", ...msg);
    }
    _debug(...msg) {
      if (this.verbose > 2) console.warn("[Cortex DEBUG]", ...msg);
    }
    init({ clientId, clientSecret, debit } = {}) {
      return this.requestAccess({ clientId, clientSecret })
        .then(({ accessGranted, message }) => {
          if (accessGranted) this._log("init: Access granted");
        })
        .then(() => this.authorize({ clientId, clientSecret, debit }))
        .then(({ cortexToken }) => {
          this._log("init: Got auth token");
          this._debug("init: Auth token", cortexToken);
          this.cortexToken = cortexToken;
        })
        .then(() => this.queryHeadsets())
        .then(headsets => {
          if (headsets.length) {
            return this.controlDevice({ command: 'connect', headset: headsets[0].id });
          } else {
            this._warn("init: No headset available to connect");
          }
        })
        .then(() => this._log("init: Connected to headset"))
        .then(() => this.emit("init"));
    }
    close() {
      return new Promise(resolve => {
        this.ws.close();
        this.emit("close");
        return resolve();
        // this.ws.once("close", resolve);
      });
    }
    emit(name, detail = {}, unique = false) {
      if (unique) {
        if (this.uniqueEvents[name]) return null;
        this.uniqueEvents[name] = detail;
      } else if (!this.listeners[name]) return null;
      return this.dispatchEvent(new CustomEvent(name, { detail }));
    }
    on(name, callback) {
      if (!this.listeners[name]) this.listeners[name] = [];
      this.listeners[name].push(callback);
      if (this.uniqueEvents[name]) return callback(this.uniqueEvents[name]);
      return this.addEventListener(name, (evt) => callback(evt.detail));
    }
    call(method, params = {}) {
      const id = this.msgId++;
      const msg = JSON.stringify({ jsonrpc: "2.0", method, params, id });
      this.ws.send(msg);
      this._log(`[${id}] -> ${method}`);

      this._debug("ws: ->", msg);
      return new Promise((resolve, reject) => {
        this.requests[id] = (err, data) => {
          delete this.requests[id];
          this._debug("rpc: err", err, "data", data);
          if (err) return reject(this.handleError(err));
          if (data) return resolve(data);
          return reject(new Error("Invalid JSON-RPC response"));
        };
      });
    }
    defineMethod(methodName, paramDefs = []) {
      if (this[methodName]) return;
      const needsAuth = paramDefs.some(p => p.name === "cortexToken");
      // console.log("method: ", methodName, " needs auth: ", needsAuth);
      const requiredParams = paramDefs.filter(p => p.required).map(p => p.name);

      this[methodName] = (params = {}) => {
        if (needsAuth && this.cortexToken && !params.cortexToken) {
          params = Object.assign({}, params, { cortexToken: this.cortexToken });
        }
        const missingParams = requiredParams.filter(p => params[p] == null);
        if (missingParams.length > 0) {
          return this.handleError(
            new Error(
              `Missing required params for ${methodName}: ${missingParams.join(
                ", "
              )}`
            )
          );
        }
        return this.call(methodName, params);
      };
    }
  }

  Cortex.JSONRPCError = JSONRPCError;
  this["Cortex"] = Cortex;
})()