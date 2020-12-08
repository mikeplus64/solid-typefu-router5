// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/solid-js/dist/solid.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorBoundary = ErrorBoundary;
exports.For = For;
exports.Index = Index;
exports.Match = Match;
exports.Show = Show;
exports.Suspense = Suspense;
exports.SuspenseList = SuspenseList;
exports.Switch = Switch;
exports.assignProps = assignProps;
exports.awaitSuspense = awaitSuspense;
exports.batch = batch;
exports.cancelCallback = cancelCallback;
exports.createComponent = createComponent;
exports.createComputed = createComputed;
exports.createContext = createContext;
exports.createDeferred = createDeferred;
exports.createEffect = createEffect;
exports.createMemo = createMemo;
exports.createMutable = createMutable;
exports.createRenderEffect = createRenderEffect;
exports.createResource = createResource;
exports.createResourceState = createResourceState;
exports.createRoot = createRoot;
exports.createSelector = createSelector;
exports.createSignal = createSignal;
exports.createState = createState;
exports.getContextOwner = getContextOwner;
exports.getListener = getListener;
exports.indexArray = indexArray;
exports.lazy = lazy;
exports.mapArray = mapArray;
exports.on = on;
exports.onCleanup = onCleanup;
exports.onError = onError;
exports.onMount = onMount;
exports.produce = produce;
exports.reconcile = reconcile;
exports.requestCallback = requestCallback;
exports.serializeGraph = serializeGraph;
exports.splitProps = splitProps;
exports.untrack = untrack;
exports.unwrap = unwrap;
exports.useContext = useContext;
exports.useTransition = useTransition;
exports.equalFn = exports.$RAW = void 0;
let taskIdCounter = 1,
    isCallbackScheduled = false,
    isPerformingWork = false,
    taskQueue = [],
    currentTask = null,
    shouldYieldToHost = null,
    yieldInterval = 5,
    deadline = 0,
    maxYieldInterval = 300,
    scheduleCallback = null,
    scheduledCallback = null;
const maxSigned31BitInt = 1073741823;

function setupScheduler() {
  if (window && window.MessageChannel) {
    const channel = new MessageChannel(),
          port = channel.port2;

    scheduleCallback = () => port.postMessage(null);

    channel.port1.onmessage = () => {
      if (scheduledCallback !== null) {
        const currentTime = performance.now();
        deadline = currentTime + yieldInterval;
        const hasTimeRemaining = true;

        try {
          const hasMoreWork = scheduledCallback(hasTimeRemaining, currentTime);

          if (!hasMoreWork) {
            scheduledCallback = null;
          } else port.postMessage(null);
        } catch (error) {
          port.postMessage(null);
          throw error;
        }
      }
    };
  } else {
    let _callback;

    scheduleCallback = () => {
      if (!_callback) {
        _callback = scheduledCallback;
        setTimeout(() => {
          const currentTime = performance.now();
          deadline = currentTime + yieldInterval;

          const hasMoreWork = _callback(true, currentTime);

          _callback = null;
          if (hasMoreWork) scheduleCallback();
        }, 0);
      }
    };
  }

  if (navigator && navigator.scheduling && navigator.scheduling.isInputPending) {
    const scheduling = navigator.scheduling;

    shouldYieldToHost = () => {
      const currentTime = performance.now();

      if (currentTime >= deadline) {
        if (scheduling.isInputPending()) {
          return true;
        }

        return currentTime >= maxYieldInterval;
      } else {
        return false;
      }
    };
  } else {
    shouldYieldToHost = () => performance.now() >= deadline;
  }
}

function enqueue(taskQueue, task) {
  function findIndex() {
    let m = 0;
    let n = taskQueue.length - 1;

    while (m <= n) {
      let k = n + m >> 1;
      let cmp = task.expirationTime - taskQueue[k].expirationTime;
      if (cmp > 0) m = k + 1;else if (cmp < 0) n = k - 1;else return k;
    }

    return m;
  }

  taskQueue.splice(findIndex(), 0, task);
}

function requestCallback(fn, options) {
  if (!scheduleCallback) setupScheduler();
  let startTime = performance.now(),
      timeout = maxSigned31BitInt;
  if (options && options.timeout) timeout = options.timeout;
  const newTask = {
    id: taskIdCounter++,
    fn,
    startTime,
    expirationTime: startTime + timeout
  };
  enqueue(taskQueue, newTask);

  if (!isCallbackScheduled && !isPerformingWork) {
    isCallbackScheduled = true;
    scheduledCallback = flushWork;
    scheduleCallback();
  }

  return newTask;
}

function cancelCallback(task) {
  task.fn = null;
}

function flushWork(hasTimeRemaining, initialTime) {
  isCallbackScheduled = false;
  isPerformingWork = true;

  try {
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    isPerformingWork = false;
  }
}

function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  currentTask = taskQueue[0] || null;

  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
      break;
    }

    const callback = currentTask.fn;

    if (callback !== null) {
      currentTask.fn = null;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      callback(didUserCallbackTimeout);
      currentTime = performance.now();

      if (currentTask === taskQueue[0]) {
        taskQueue.shift();
      }
    } else taskQueue.shift();

    currentTask = taskQueue[0] || null;
  }

  return currentTask !== null;
}

const equalFn = (a, b) => a === b;

exports.equalFn = equalFn;
let ERROR = null;
let runEffects = runQueue;
const NOTPENDING = {};
const STALE = 1;
const PENDING = 2;
const UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
const [transPending, setTransPending] = createSignal(false, true);
var Owner = null;
var Listener = null;
let Pending = null;
let Updates = null;
let Effects = null;
let Transition = null;
let ExecCount = 0;

function createRoot(fn, detachedOwner) {
  detachedOwner && (Owner = detachedOwner);
  const listener = Listener,
        owner = Owner,
        root = fn.length === 0 && !false ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: null,
    owner,
    attached: !!detachedOwner
  };
  Owner = root;
  Listener = null;
  let result;

  try {
    runUpdates(() => result = fn(() => cleanNode(root)), true);
  } finally {
    Listener = listener;
    Owner = owner;
  }

  return result;
}

function createSignal(value, areEqual, options) {
  const s = {
    value,
    observers: null,
    observerSlots: null,
    pending: NOTPENDING,
    comparator: areEqual ? typeof areEqual === "function" ? areEqual : equalFn : undefined
  };
  return [readSignal.bind(s), writeSignal.bind(s)];
}

function createComputed(fn, value) {
  updateComputation(createComputation(fn, value, true));
}

function createRenderEffect(fn, value) {
  updateComputation(createComputation(fn, value, false));
}

function createEffect(fn, value) {
  if (globalThis._$HYDRATION && globalThis._$HYDRATION.asyncSSR) return;
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false),
        s = SuspenseContext && lookup(Owner, SuspenseContext.id);
  if (s) c.suspense = s;
  c.user = true;
  Effects && Effects.push(c);
}

function resumeEffects(e) {
  Transition && (Transition.running = true);
  Effects.push.apply(Effects, e);
  e.length = 0;
}

function createMemo(fn, value, areEqual) {
  const c = createComputation(fn, value, true);
  c.pending = NOTPENDING;
  c.observers = null;
  c.observerSlots = null;
  c.state = 0;
  c.comparator = areEqual ? typeof areEqual === "function" ? areEqual : equalFn : undefined;
  updateComputation(c);
  return readSignal.bind(c);
}

function createDeferred(source, options) {
  let t,
      timeout = options ? options.timeoutMs : undefined;
  const [deferred, setDeferred] = createSignal();
  const node = createComputation(() => {
    if (!t || !t.fn) t = requestCallback(() => setDeferred(node.value), timeout !== undefined ? {
      timeout
    } : undefined);
    return source();
  }, undefined, true);
  updateComputation(node);
  setDeferred(node.value);
  return deferred;
}

function createSelector(source, fn = equalFn) {
  let subs = new Map();
  const node = createComputation(p => {
    const v = source();

    for (const key of subs.keys()) if (fn(key, v) || p && fn(key, p)) {
      const c = subs.get(key);
      c.state = STALE;
      if (c.pure) Updates.push(c);else Effects.push(c);
    }

    return v;
  }, undefined, true);
  updateComputation(node);
  return key => {
    if (Listener) {
      subs.set(key, Listener);
      onCleanup(() => subs.delete(key));
    }

    return fn(key, node.value);
  };
}

function batch(fn) {
  if (Pending) return fn();
  const q = Pending = [],
        result = fn();
  Pending = null;
  runUpdates(() => {
    for (let i = 0; i < q.length; i += 1) {
      const data = q[i];

      if (data.pending !== NOTPENDING) {
        const pending = data.pending;
        data.pending = NOTPENDING;
        writeSignal.call(data, pending);
      }
    }
  }, false);
  return result;
}

function useTransition() {
  return [transPending, fn => {
    if (SuspenseContext) {
      Transition || (Transition = {
        sources: new Set(),
        effects: [],
        promises: new Set(),
        disposed: new Set(),
        running: true
      });
      Transition.running = true;
    }

    batch(fn);
  }];
}

function untrack(fn) {
  let result,
      listener = Listener;
  Listener = null;
  result = fn();
  Listener = listener;
  return result;
}

function on(...args) {
  const fn = args.pop();
  let deps;
  let isArray = true;
  let prev;

  if (args.length < 2) {
    deps = args[0];
    isArray = false;
  } else deps = args;

  return prevResult => {
    let value;

    if (isArray) {
      value = [];
      if (!prev) prev = [];

      for (let i = 0; i < deps.length; i++) value.push(deps[i]());
    } else value = deps();

    const result = untrack(() => fn(value, prev, prevResult));
    prev = value;
    return result;
  };
}

function onMount(fn) {
  createEffect(() => untrack(fn));
}

function onCleanup(fn) {
  if (Owner === null) ;else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
  return fn;
}

function onError(fn) {
  ERROR || (ERROR = Symbol("error"));
  if (Owner === null) ;else if (Owner.context === null) Owner.context = {
    [ERROR]: [fn]
  };else if (!Owner.context[ERROR]) Owner.context[ERROR] = [fn];else Owner.context[ERROR].push(fn);
}

function getListener() {
  return Listener;
}

function getContextOwner() {
  return Owner;
}

function serializeGraph(owner) {
  return {};
}

function createContext(defaultValue) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}

function useContext(context) {
  return lookup(Owner, context.id) || context.defaultValue;
}

let SuspenseContext;

function getSuspenseContext() {
  return SuspenseContext || (SuspenseContext = createContext({}));
}

function createResource(init, options = {}) {
  const [s, set] = createSignal(init),
        [loading, setLoading] = createSignal(false, true),
        contexts = new Set(),
        h = globalThis._$HYDRATION || {};
  let err = null,
      pr = null;

  function loadEnd(p, v, e) {
    if (pr === p) {
      err = e;
      pr = null;

      if (Transition && Transition.promises.has(p)) {
        Transition.promises.delete(p);
        runUpdates(() => {
          Transition.running = true;

          if (!Transition.promises.size) {
            Effects.push.apply(Effects, Transition.effects);
            Transition.effects = [];
          }

          completeLoad(v);
        }, false);
      } else completeLoad(v);
    }

    return v;
  }

  function completeLoad(v) {
    batch(() => {
      set(v);
      if (h.asyncSSR && options.name) h.resources[options.name] = v;
      setLoading(false);

      for (let c of contexts.keys()) c.decrement();

      contexts.clear();
    });
  }

  function read() {
    const c = SuspenseContext && lookup(Owner, SuspenseContext.id),
          v = s();
    if (err) throw err;

    if (Listener && !Listener.user && c) {
      if (!Listener.pure) createComputed(() => {
        s();
        if (pr && c.resolved && Transition) Transition.promises.add(pr);
      });

      if (pr) {
        if (Listener.pure && c.resolved && Transition) Transition.promises.add(pr);else if (!contexts.has(c)) {
          c.increment();
          contexts.add(c);
        }
      }
    }

    return v;
  }

  function load(fn) {
    err = null;
    let p;
    const hydrating = h.context && !!h.context.registry;

    if (hydrating) {
      if (h.loadResource && !options.notStreamed) {
        fn = h.loadResource;
      } else if (options.name && h.resources && options.name in h.resources) {
        fn = () => {
          const data = h.resources[options.name];
          delete h.resources[options.name];
          return data;
        };
      }
    }

    p = fn();
    Transition && pr && Transition.promises.delete(pr);

    if (typeof p !== "object" || !("then" in p)) {
      pr = null;
      completeLoad(p);
      return p;
    }

    pr = p;
    batch(() => {
      setLoading(true);
      set(untrack(s));
    });
    return p.then(v => loadEnd(p, v), e => loadEnd(p, s(), e));
  }

  Object.defineProperty(read, "loading", {
    get() {
      return loading();
    }

  });
  return [read, load];
}

function readSignal() {
  if (this.state && this.sources) {
    const updates = Updates;
    Updates = null;
    this.state === STALE ? updateComputation(this) : lookDownstream(this);
    Updates = updates;
  }

  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;

    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }

    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }

  if (Transition && Transition.running && Transition.sources.has(this)) return this.tValue;
  return this.value;
}

function writeSignal(value, isComp) {
  if (this.comparator) {
    if (Transition && Transition.running && Transition.sources.has(this)) {
      if (this.comparator(this.tValue, value)) return value;
    } else if (this.comparator(this.value, value)) return value;
  }

  if (Pending) {
    if (this.pending === NOTPENDING) Pending.push(this);
    this.pending = value;
    return value;
  }

  if (Transition) {
    if (Transition.running || !isComp && Transition.sources.has(this)) {
      Transition.sources.add(this);
      this.tValue = value;
    }

    if (!Transition.running) this.value = value;
  } else this.value = value;

  if (this.observers && (!Updates || this.observers.length)) {
    runUpdates(() => {
      for (let i = 0; i < this.observers.length; i += 1) {
        const o = this.observers[i];
        if (Transition && Transition.running && Transition.disposed.has(o)) continue;
        if (o.observers && o.state !== PENDING) markUpstream(o);
        o.state = STALE;
        if (o.pure) Updates.push(o);else Effects.push(o);
      }

      if (Updates.length > 10e5) {
        Updates = [];
        throw new Error("Potential Infinite Loop Detected.");
      }
    }, false);
  }

  return value;
}

function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const owner = Owner,
        listener = Listener,
        time = ExecCount;
  Listener = Owner = node;
  runComputation(node, node.value, time);

  if (Transition && !Transition.running && Transition.sources.has(node)) {
    Transition.running = true;
    runComputation(node, node.tValue, time);
    Transition.running = false;
  }

  Listener = listener;
  Owner = owner;
}

function runComputation(node, value, time) {
  let nextValue;

  try {
    nextValue = node.fn(value);
  } catch (err) {
    handleError(err);
  }

  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.observers && node.observers.length) {
      writeSignal.call(node, nextValue, true);
    } else if (Transition && Transition.running && node.pure) {
      Transition.sources.add(node);
      node.tValue = nextValue;
    } else node.value = nextValue;

    node.updatedAt = time;
  }
}

function createComputation(fn, init, pure) {
  const c = {
    fn,
    state: STALE,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: null,
    pure
  };
  if (Owner === null) ;else if (Owner !== UNOWNED) {
    if (Transition && Transition.running && Owner.pure) {
      if (!Owner.tOwned) Owner.tOwned = [c];else Owner.tOwned.push(c);
    } else {
      if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
    }
  }
  return c;
}

function runTop(node) {
  let top = node.state === STALE && node,
      pending;
  if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
  const runningTransition = Transition && Transition.running;

  while ((node.fn || runningTransition && node.attached) && (node = node.owner)) {
    if (runningTransition && Transition.disposed.has(node)) return;
    if (node.state === PENDING) pending = node;else if (node.state === STALE) {
      top = node;
      pending = undefined;
    }
  }

  if (pending) {
    const updates = Updates;
    Updates = null;
    lookDownstream(pending);
    Updates = updates;
    if (!top || top.state !== STALE) return;

    if (runningTransition) {
      node = top;

      while ((node.fn || node.attached) && (node = node.owner)) {
        if (Transition.disposed.has(node)) return;
      }
    }
  }

  top && updateComputation(top);
}

function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) wait = true;else Effects = [];
  ExecCount++;

  try {
    fn();
  } catch (err) {
    handleError(err);
  } finally {
    if (Updates) {
      runQueue(Updates);
      Updates = null;
    }

    if (wait) return;

    if (Transition && Transition.running) {
      Transition.running = false;

      if (Transition.promises.size) {
        Transition.effects.push.apply(Transition.effects, Effects);
        Effects = null;
        setTransPending(true);
        return;
      }

      Transition.sources.forEach(v => {
        v.value = v.tValue;

        if (v.owned) {
          for (let i = 0, len = v.owned.length; i < len; i++) cleanNode(v.owned[i]);
        }

        if (v.tOwned) v.owned = v.tOwned;
        delete v.tValue;
        delete v.tOwned;
      });
      Transition = null;
      setTransPending(false);
    }

    if (Effects.length) batch(() => {
      runEffects(Effects);
      Effects = null;
    });else {
      Effects = null;
    }
  }
}

function runQueue(queue) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}

function runUserEffects(queue) {
  let i,
      userLength = 0;

  for (i = 0; i < queue.length; i++) {
    const e = queue[i];
    if (!e.user) runTop(e);else queue[userLength++] = e;
  }

  const resume = queue.length;

  for (i = 0; i < userLength; i++) runTop(queue[i]);

  for (i = resume; i < queue.length; i++) runTop(queue[i]);
}

function lookDownstream(node) {
  node.state = 0;

  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];

    if (source.sources) {
      if (source.state === STALE) runTop(source);else if (source.state === PENDING) lookDownstream(source);
    }
  }
}

function markUpstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];

    if (!o.state) {
      o.state = PENDING;
      o.observers && markUpstream(o);
    }
  }
}

function cleanNode(node) {
  let i;

  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(),
            index = node.sourceSlots.pop(),
            obs = source.observers;

      if (obs && obs.length) {
        const n = obs.pop(),
              s = source.observerSlots.pop();

        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }

  if (Transition && Transition.running && node.pure) {
    if (node.tOwned) {
      for (i = 0; i < node.tOwned.length; i++) cleanNode(node.tOwned[i]);

      delete node.tOwned;
    }

    reset(node, true);
  } else if (node.owned) {
    for (i = 0; i < node.owned.length; i++) cleanNode(node.owned[i]);

    node.owned = null;
  }

  if (node.cleanups) {
    for (i = 0; i < node.cleanups.length; i++) node.cleanups[i]();

    node.cleanups = null;
  }

  node.state = 0;
  node.context = null;
}

function reset(node, top) {
  if (!top) {
    node.state = 0;
    Transition.disposed.add(node);
  }

  if (node.owned) {
    for (let i = 0; i < node.owned.length; i++) reset(node.owned[i]);
  }
}

function handleError(err) {
  const fns = ERROR && lookup(Owner, ERROR);
  if (!fns) throw err;
  fns.forEach(f => f(err));
}

function lookup(owner, key) {
  return owner && (owner.context && owner.context[key] || owner.owner && lookup(owner.owner, key));
}

function resolveChildren(children) {
  if (typeof children === "function") return createMemo(() => resolveChildren(children()));

  if (Array.isArray(children)) {
    const results = [];

    for (let i = 0; i < children.length; i++) {
      let result = resolveChildren(children[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }

    return results;
  }

  return children;
}

function createProvider(id) {
  return function provider(props) {
    return createMemo(() => {
      Owner.context = {
        [id]: props.value
      };
      return resolveChildren(props.children);
    });
  };
}

const $RAW = Symbol("state-raw"),
      $NODE = Symbol("state-node"),
      $PROXY = Symbol("state-proxy"),
      $NAME = Symbol("state-name");
exports.$RAW = $RAW;

function wrap(value, name, processProps, traps) {
  let p = value[$PROXY];

  if (!p) {
    Object.defineProperty(value, $PROXY, {
      value: p = new Proxy(value, traps || proxyTraps)
    });

    if (processProps) {
      let keys = Object.keys(value),
          desc = Object.getOwnPropertyDescriptors(value);

      for (let i = 0, l = keys.length; i < l; i++) {
        const prop = keys[i];

        if (desc[prop].get) {
          const get = createMemo(desc[prop].get.bind(p));
          Object.defineProperty(value, prop, {
            get
          });
        }

        if (desc[prop].set) {
          const og = desc[prop].set,
                set = v => batch(() => og.call(p, v));

          Object.defineProperty(value, prop, {
            set
          });
        }
      }
    }
  }

  return p;
}

function isWrappable(obj) {
  return obj != null && typeof obj === "object" && (!obj.__proto__ || obj.__proto__ === Object.prototype || Array.isArray(obj));
}

function unwrap(item, skipGetters) {
  let result, unwrapped, v, prop;
  if (result = item != null && item[$RAW]) return result;
  if (!isWrappable(item)) return item;

  if (Array.isArray(item)) {
    if (Object.isFrozen(item)) item = item.slice(0);

    for (let i = 0, l = item.length; i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v, skipGetters)) !== v) item[i] = unwrapped;
    }
  } else {
    if (Object.isFrozen(item)) item = Object.assign({}, item);
    let keys = Object.keys(item),
        desc = skipGetters && Object.getOwnPropertyDescriptors(item);

    for (let i = 0, l = keys.length; i < l; i++) {
      prop = keys[i];
      if (skipGetters && desc[prop].get) continue;
      v = item[prop];
      if ((unwrapped = unwrap(v, skipGetters)) !== v) item[prop] = unwrapped;
    }
  }

  return item;
}

function getDataNodes(target) {
  let nodes = target[$NODE];
  if (!nodes) Object.defineProperty(target, $NODE, {
    value: nodes = {}
  });
  return nodes;
}

function proxyDescriptor(target, property) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);
  if (!desc || desc.get || property === $PROXY || property === $NODE || property === $NAME) return desc;
  delete desc.value;
  delete desc.writable;

  desc.get = () => target[property];

  return desc;
}

const proxyTraps = {
  get(target, property, receiver) {
    if (property === $RAW) return target;
    if (property === $PROXY) return receiver;
    const value = target[property];
    if (property === $NODE || property === "__proto__") return value;
    const wrappable = isWrappable(value);

    if (Listener && (typeof value !== "function" || target.hasOwnProperty(property))) {
      let nodes, node;

      if (wrappable && (nodes = getDataNodes(value))) {
        node = nodes._ || (nodes._ = createSignal());
        node[0]();
      }

      nodes = getDataNodes(target);
      node = nodes[property] || (nodes[property] = createSignal());
      node[0]();
    }

    return wrappable ? wrap(value) : value;
  },

  set() {
    return true;
  },

  deleteProperty() {
    return true;
  },

  getOwnPropertyDescriptor: proxyDescriptor
};

function setProperty(state, property, value, force) {
  if (!force && state[property] === value) return;
  const notify = Array.isArray(state) || !(property in state);

  if (value === undefined) {
    delete state[property];
  } else state[property] = value;

  let nodes = getDataNodes(state),
      node;
  (node = nodes[property]) && node[1]();
  notify && (node = nodes._) && node[1]();
}

function mergeState(state, value, force) {
  const keys = Object.keys(value);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    setProperty(state, key, value[key], force);
  }
}

function updatePath(current, path, traversed = []) {
  let part,
      prev = current;

  if (path.length > 1) {
    part = path.shift();
    const partType = typeof part,
          isArray = Array.isArray(current);

    if (Array.isArray(part)) {
      for (let i = 0; i < part.length; i++) {
        updatePath(current, [part[i]].concat(path), [part[i]].concat(traversed));
      }

      return;
    } else if (isArray && partType === "function") {
      for (let i = 0; i < current.length; i++) {
        if (part(current[i], i)) updatePath(current, [i].concat(path), [i].concat(traversed));
      }

      return;
    } else if (isArray && partType === "object") {
      const {
        from = 0,
        to = current.length - 1,
        by = 1
      } = part;

      for (let i = from; i <= to; i += by) {
        updatePath(current, [i].concat(path), [i].concat(traversed));
      }

      return;
    } else if (path.length > 1) {
      updatePath(current[part], path, [part].concat(traversed));
      return;
    }

    prev = current[part];
    traversed = [part].concat(traversed);
  }

  let value = path[0];

  if (typeof value === "function") {
    value = value(prev, traversed);
    if (value === prev) return;
  }

  if (part === undefined && value == undefined) return;
  value = unwrap(value);

  if (part === undefined || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) {
    mergeState(prev, value);
  } else setProperty(current, part, value);
}

function createState(state, options) {
  const unwrappedState = unwrap(state || {}, true);
  const wrappedState = wrap(unwrappedState, false, true);

  function setState(...args) {
    batch(() => updatePath(unwrappedState, args));
  }

  return [wrappedState, setState];
}

function createResourceNode(v, name) {
  const node = createSignal(),
        [r, load] = createResource(v, {
    name
  });
  return [() => (r(), node[0]()), node[1], load, () => r.loading];
}

function createResourceState(state, options = {}) {
  const loadingTraps = {
    get(nodes, property) {
      const node = nodes[property] || (nodes[property] = createResourceNode(undefined, options.name && `${options.name}:${property}`));
      return node[3]();
    },

    set() {
      return true;
    },

    deleteProperty() {
      return true;
    }

  };
  const resourceTraps = {
    get(target, property, receiver) {
      if (property === $RAW) return target;
      if (property === $PROXY) return receiver;
      if (property === "loading") return new Proxy(getDataNodes(target), loadingTraps);
      const value = target[property];
      if (property === $NODE || property === "__proto__") return value;
      const wrappable = isWrappable(value);

      if (Listener && (typeof value !== "function" || target.hasOwnProperty(property))) {
        let nodes, node;

        if (wrappable && (nodes = getDataNodes(value))) {
          node = nodes._ || (nodes._ = createSignal());
          node[0]();
        }

        nodes = getDataNodes(target);
        node = nodes[property] || (nodes[property] = createResourceNode(value, `${options.name}:${property}`));
        node[0]();
      }

      return wrappable ? wrap(value) : value;
    },

    set() {
      return true;
    },

    deleteProperty() {
      return true;
    },

    getOwnPropertyDescriptor: proxyDescriptor
  };
  const unwrappedState = unwrap(state || {}, true),
        wrappedState = wrap(unwrappedState, false, true, resourceTraps);

  function setState(...args) {
    batch(() => updatePath(unwrappedState, args));
  }

  function loadState(v, r) {
    const nodes = getDataNodes(unwrappedState),
          keys = Object.keys(v);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i],
            node = nodes[k] || (nodes[k] = createResourceNode(unwrappedState[k], `${options.name}:${k}`)),
            resolver = v => (r ? setState(k, r(v)) : setProperty(unwrappedState, k, v), v),
            p = node[2](v[k]);

      typeof p === "object" && "then" in p ? p.then(resolver) : resolver(p);
    }
  }

  return [wrappedState, loadState, setState];
}

const proxyTraps$1 = {
  get(target, property, receiver) {
    if (property === $RAW) return target;
    if (property === $PROXY) return receiver;
    const value = target[property];
    if (property === $NODE || property === "__proto__") return value;
    const wrappable = isWrappable(value);

    if (Listener && (typeof value !== "function" || target.hasOwnProperty(property))) {
      let nodes, node;

      if (wrappable && (nodes = getDataNodes(value))) {
        node = nodes._ || (nodes._ = createSignal());
        node[0]();
      }

      nodes = getDataNodes(target);
      node = nodes[property] || (nodes[property] = createSignal());
      node[0]();
    }

    return wrappable ? wrap(value, false, false, proxyTraps$1) : value;
  },

  set(target, property, value) {
    setProperty(target, property, unwrap(value));
    return true;
  },

  deleteProperty(target, property) {
    setProperty(target, property, undefined);
    return true;
  },

  getOwnPropertyDescriptor: proxyDescriptor
};

function createMutable(state, options) {
  const unwrappedState = unwrap(state || {}, true);
  const wrappedState = wrap(unwrappedState, false, true, proxyTraps$1);
  return wrappedState;
}

function applyState(target, parent, property, merge, key) {
  let previous = parent[property];
  if (target === previous) return;

  if (!isWrappable(target) || !isWrappable(previous) || key && target[key] !== previous[key]) {
    target !== previous && setProperty(parent, property, target);
    return;
  }

  if (Array.isArray(target)) {
    if (target.length && previous.length && (!merge || key && target[0][key] != null)) {
      let i, j, start, end, newEnd, item, newIndicesNext, keyVal;

      for (start = 0, end = Math.min(previous.length, target.length); start < end && (previous[start] === target[start] || key && previous[start][key] === target[start][key]); start++) {
        applyState(target[start], previous, start, merge, key);
      }

      const temp = new Array(target.length),
            newIndices = new Map();

      for (end = previous.length - 1, newEnd = target.length - 1; end >= start && newEnd >= start && (previous[end] === target[newEnd] || key && previous[end][key] === target[newEnd][key]); end--, newEnd--) {
        temp[newEnd] = previous[end];
      }

      if (start > newEnd || start > end) {
        for (j = start; j <= newEnd; j++) setProperty(previous, j, target[j]);

        for (; j < target.length; j++) {
          setProperty(previous, j, temp[j]);
          applyState(target[j], previous, j, merge, key);
        }

        if (previous.length > target.length) setProperty(previous, "length", target.length);
        return;
      }

      newIndicesNext = new Array(newEnd + 1);

      for (j = newEnd; j >= start; j--) {
        item = target[j];
        keyVal = key ? item[key] : item;
        i = newIndices.get(keyVal);
        newIndicesNext[j] = i === undefined ? -1 : i;
        newIndices.set(keyVal, j);
      }

      for (i = start; i <= end; i++) {
        item = previous[i];
        keyVal = key ? item[key] : item;
        j = newIndices.get(keyVal);

        if (j !== undefined && j !== -1) {
          temp[j] = previous[i];
          j = newIndicesNext[j];
          newIndices.set(keyVal, j);
        }
      }

      for (j = start; j < target.length; j++) {
        if (j in temp) {
          setProperty(previous, j, temp[j]);
          applyState(target[j], previous, j, merge, key);
        } else setProperty(previous, j, target[j]);
      }
    } else {
      for (let i = 0, len = target.length; i < len; i++) {
        applyState(target[i], previous, i, merge, key);
      }
    }

    if (previous.length > target.length) setProperty(previous, "length", target.length);
    return;
  }

  const targetKeys = Object.keys(target);

  for (let i = 0, len = targetKeys.length; i < len; i++) {
    applyState(target[targetKeys[i]], previous, targetKeys[i], merge, key);
  }

  const previousKeys = Object.keys(previous);

  for (let i = 0, len = previousKeys.length; i < len; i++) {
    if (target[previousKeys[i]] === undefined) setProperty(previous, previousKeys[i], undefined);
  }
}

function reconcile(value, options = {}) {
  const {
    merge,
    key = "id"
  } = options,
        v = unwrap(value);
  return state => {
    if (!isWrappable(state)) return v;
    applyState(v, {
      state
    }, "state", merge, key);
    return state;
  };
}

const setterTraps = {
  get(target, property) {
    if (property === $RAW) return target;
    const value = target[property];
    return isWrappable(value) ? new Proxy(value, setterTraps) : value;
  },

  set(target, property, value) {
    setProperty(target, property, unwrap(value));
    return true;
  },

  deleteProperty(target, property) {
    setProperty(target, property, undefined);
    return true;
  }

};

function produce(fn) {
  return state => {
    if (isWrappable(state)) fn(new Proxy(state, setterTraps));
    return state;
  };
}

const FALLBACK = Symbol("fallback");

function mapArray(list, mapFn, options = {}) {
  let items = [],
      mapped = [],
      disposers = [],
      len = 0,
      indexes = mapFn.length > 1 ? [] : null,
      ctx = Owner;
  onCleanup(() => {
    for (let i = 0, length = disposers.length; i < length; i++) disposers[i]();
  });
  return () => {
    let newItems = list() || [],
        i,
        j;
    return untrack(() => {
      let newLen = newItems.length,
          newIndices,
          newIndicesNext,
          temp,
          tempdisposers,
          tempIndexes,
          start,
          end,
          newEnd,
          item;

      if (newLen === 0) {
        if (len !== 0) {
          for (i = 0; i < len; i++) disposers[i]();

          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          indexes && (indexes = []);
        }

        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot(disposer => {
            disposers[0] = disposer;
            return options.fallback();
          }, ctx);
          len = 1;
        }
      } else if (len === 0) {
        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = createRoot(mapper, ctx);
        }

        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        indexes && (tempIndexes = new Array(newLen));

        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);

        for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }

        newIndices = new Map();
        newIndicesNext = new Array(newEnd + 1);

        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }

        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);

          if (j !== undefined && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            indexes && (tempIndexes[j] = indexes[i]);
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }

        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];

            if (indexes) {
              indexes[j] = tempIndexes[j];
              indexes[j](j);
            }
          } else mapped[j] = createRoot(mapper, ctx);
        }

        len = mapped.length = newLen;
        items = newItems.slice(0);
      }

      return mapped;
    });

    function mapper(disposer) {
      disposers[j] = disposer;

      if (indexes) {
        const [s, set] = createSignal(j, true);
        indexes[j] = set;
        return mapFn(newItems[j], s);
      }

      return mapFn(newItems[j]);
    }
  };
}

function indexArray(list, mapFn, options = {}) {
  let items = [],
      mapped = [],
      disposers = [],
      signals = [],
      len = 0,
      i,
      ctx = Owner;
  onCleanup(() => {
    for (let i = 0, length = disposers.length; i < length; i++) disposers[i]();
  });
  return () => {
    const newItems = list() || [];
    return untrack(() => {
      if (newItems.length === 0) {
        if (len !== 0) {
          for (i = 0; i < len; i++) disposers[i]();

          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          signals = [];
        }

        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot(disposer => {
            disposers[0] = disposer;
            return options.fallback();
          }, ctx);
          len = 1;
        }

        return mapped;
      }

      if (items[0] === FALLBACK) {
        disposers[0]();
        disposers = [];
        items = [];
        mapped = [];
        len = 0;
      }

      for (i = 0; i < newItems.length; i++) {
        if (i < items.length && items[i] !== newItems[i]) {
          signals[i](newItems[i]);
        } else if (i >= items.length) {
          mapped[i] = createRoot(mapper, ctx);
        }
      }

      for (; i < items.length; i++) {
        disposers[i]();
      }

      len = mapped.length = signals.length = disposers.length = newItems.length;
      items = newItems.slice(0);
      return mapped;
    });

    function mapper(disposer) {
      disposers[i] = disposer;
      const [s, set] = createSignal(newItems[i]);
      signals[i] = set;
      return mapFn(s, i);
    }
  };
}

function createComponent(Comp, props) {
  return untrack(() => Comp(props));
}

function assignProps(target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    const descriptors = Object.getOwnPropertyDescriptors(sources[i]);
    Object.defineProperties(target, descriptors);
  }

  return target;
}

function splitProps(props, ...keys) {
  const descriptors = Object.getOwnPropertyDescriptors(props),
        split = k => {
    const clone = {};

    for (let i = 0; i < k.length; i++) {
      const key = k[i];

      if (descriptors[key]) {
        Object.defineProperty(clone, key, descriptors[key]);
        delete descriptors[key];
      }
    }

    return clone;
  };

  return keys.map(split).concat(split(Object.keys(descriptors)));
}

function lazy(fn) {
  return props => {
    const h = globalThis._$HYDRATION || {},
          hydrating = h.context && h.context.registry,
          ctx = nextHydrateContext(),
          [s, l] = createResource(undefined, {
      notStreamed: true
    });

    if (hydrating && h.resources) {
      fn().then(mod => l(() => mod.default));
    } else l(() => fn().then(mod => mod.default));

    let Comp;
    return createMemo(() => (Comp = s()) && untrack(() => {
      if (!ctx) return Comp(props);
      const c = h.context;
      setHydrateContext(ctx);
      const r = Comp(props);
      !c && setHydrateContext();
      return r;
    }));
  };
}

function setHydrateContext(context) {
  globalThis._$HYDRATION.context = context;
}

function nextHydrateContext() {
  const hydration = globalThis._$HYDRATION;
  return hydration && hydration.context ? {
    id: `${hydration.context.id}.${hydration.context.count++}`,
    count: 0,
    registry: hydration.context.registry
  } : undefined;
}

function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(mapArray(() => props.each, props.children, fallback ? fallback : undefined));
}

function Index(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(indexArray(() => props.each, props.children, fallback ? fallback : undefined));
}

function Show(props) {
  const childDesc = Object.getOwnPropertyDescriptor(props, "children").value,
        callFn = typeof childDesc === "function" && childDesc.length,
        condition = createMemo(callFn ? () => props.when : () => !!props.when, undefined, true);
  return createMemo(() => {
    const c = condition();
    return c ? callFn ? untrack(() => props.children(c)) : props.children : props.fallback;
  });
}

function Switch(props) {
  let conditions = props.children;
  Array.isArray(conditions) || (conditions = [conditions]);
  const evalConditions = createMemo(() => {
    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i].when;
      if (c) return [i, conditions[i].keyed ? c : !!c];
    }

    return [-1];
  }, undefined, (a, b) => a && a[0] === b[0] && a[1] === b[1]);
  return createMemo(() => {
    const [index, when] = evalConditions();
    if (index < 0) return props.fallback;
    const c = conditions[index].children;
    return typeof c === "function" && c.length ? untrack(() => c(when)) : c;
  });
}

function Match(props) {
  const childDesc = Object.getOwnPropertyDescriptor(props, "children").value;
  props.keyed = typeof childDesc === "function" && !!childDesc.length;
  return props;
}

function ErrorBoundary(props) {
  const [errored, setErrored] = createSignal(),
        fallbackDesc = Object.getOwnPropertyDescriptor(props, "fallback").value,
        callFn = typeof fallbackDesc === "function" && !!fallbackDesc.length;
  onError(setErrored);
  let e;
  return createMemo(() => (e = errored()) != null ? callFn ? untrack(() => props.fallback(e)) : props.fallback : props.children);
}

const SuspenseListContext = createContext();
let trackSuspense = false;

function awaitSuspense(fn) {
  const SuspenseContext = getSuspenseContext();

  if (!trackSuspense) {
    let count = 0;
    const [active, trigger] = createSignal(false);
    SuspenseContext.active = active;

    SuspenseContext.increment = () => count++ === 0 && trigger(true);

    SuspenseContext.decrement = () => --count <= 0 && trigger(false);

    trackSuspense = true;
  }

  return () => new Promise(resolve => {
    const res = fn();
    createRenderEffect(() => !SuspenseContext.active() && resolve(res));
  });
}

function SuspenseList(props) {
  let index = 0,
      suspenseSetter,
      showContent,
      showFallback;
  const listContext = useContext(SuspenseListContext);

  if (listContext) {
    const [inFallback, setFallback] = createSignal(false, true);
    suspenseSetter = setFallback;
    [showContent, showFallback] = listContext.register(inFallback);
  }

  const registry = [],
        comp = createComponent(SuspenseListContext.Provider, {
    value: {
      register: inFallback => {
        const [showingContent, showContent] = createSignal(false, true),
              [showingFallback, showFallback] = createSignal(false, true);
        registry[index++] = {
          inFallback,
          showContent,
          showFallback
        };
        return [showingContent, showingFallback];
      }
    },

    get children() {
      return props.children;
    }

  });
  createComputed(() => {
    const reveal = props.revealOrder,
          tail = props.tail,
          visibleContent = showContent ? showContent() : true,
          visibleFallback = showFallback ? showFallback() : true,
          reverse = reveal === "backwards";

    if (reveal === "together") {
      const all = registry.every(i => !i.inFallback());
      suspenseSetter && suspenseSetter(!all);
      registry.forEach(i => {
        i.showContent(all && visibleContent);
        i.showFallback(visibleFallback);
      });
      return;
    }

    let stop = false;

    for (let i = 0, len = registry.length; i < len; i++) {
      const n = reverse ? len - i - 1 : i,
            s = registry[n].inFallback();

      if (!stop && !s) {
        registry[n].showContent(visibleContent);
        registry[n].showFallback(visibleFallback);
      } else {
        const next = !stop;
        if (next && suspenseSetter) suspenseSetter(true);

        if (!tail || next && tail === "collapsed") {
          registry[n].showFallback(visibleFallback);
        } else registry[n].showFallback(false);

        stop = true;
        registry[n].showContent(next);
      }
    }

    if (!stop && suspenseSetter) suspenseSetter(false);
  });
  return comp;
}

function Suspense(props) {
  let counter = 0,
      showContent,
      showFallback;
  const [inFallback, setFallback] = createSignal(false),
        SuspenseContext = getSuspenseContext(),
        store = {
    increment: () => {
      if (++counter === 1) {
        setFallback(true);
        trackSuspense && SuspenseContext.increment();
      }
    },
    decrement: () => {
      if (--counter === 0) {
        setFallback(false);
        trackSuspense && queueMicrotask(SuspenseContext.decrement);
      }
    },
    inFallback,
    effects: [],
    resolved: false
  };
  const listContext = useContext(SuspenseListContext);
  if (listContext) [showContent, showFallback] = listContext.register(store.inFallback);
  return createComponent(SuspenseContext.Provider, {
    value: store,

    get children() {
      const rendered = untrack(() => props.children);
      return () => {
        const inFallback = store.inFallback(),
              visibleContent = showContent ? showContent() : true,
              visibleFallback = showFallback ? showFallback() : true;

        if (!inFallback && visibleContent) {
          store.resolved = true;
          resumeEffects(store.effects);
          return rendered;
        }

        if (!visibleFallback) return;
        return props.fallback;
      };
    }

  });
}
},{}],"node_modules/solid-js/web/dist/web.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dynamic = Dynamic;
exports.Portal = Portal;
exports.assign = assign;
exports.classList = classList;
exports.clearDelegatedEvents = clearDelegatedEvents;
exports.delegateEvents = delegateEvents;
exports.dynamicProperty = dynamicProperty;
exports.escape = escape;
exports.generateHydrationScript = generateHydrationScript;
exports.getNextElement = getNextElement;
exports.getNextMarker = getNextMarker;
exports.hydrate = hydrate;
exports.insert = insert;
exports.memo = memo;
exports.render = render;
exports.renderToNodeStream = renderToNodeStream;
exports.renderToString = renderToString;
exports.renderToWebStream = renderToWebStream;
exports.resolveSSRNode = resolveSSRNode;
exports.runHydrationEvents = runHydrationEvents;
exports.setAttribute = setAttribute;
exports.setAttributeNS = setAttributeNS;
exports.spread = spread;
exports.ssr = ssr;
exports.ssrBoolean = ssrBoolean;
exports.ssrClassList = ssrClassList;
exports.ssrSpread = ssrSpread;
exports.ssrStyle = ssrStyle;
exports.style = style;
exports.template = template;
Object.defineProperty(exports, "ErrorBoundary", {
  enumerable: true,
  get: function () {
    return _solidJs.ErrorBoundary;
  }
});
Object.defineProperty(exports, "For", {
  enumerable: true,
  get: function () {
    return _solidJs.For;
  }
});
Object.defineProperty(exports, "Index", {
  enumerable: true,
  get: function () {
    return _solidJs.Index;
  }
});
Object.defineProperty(exports, "Match", {
  enumerable: true,
  get: function () {
    return _solidJs.Match;
  }
});
Object.defineProperty(exports, "Show", {
  enumerable: true,
  get: function () {
    return _solidJs.Show;
  }
});
Object.defineProperty(exports, "Suspense", {
  enumerable: true,
  get: function () {
    return _solidJs.Suspense;
  }
});
Object.defineProperty(exports, "SuspenseList", {
  enumerable: true,
  get: function () {
    return _solidJs.SuspenseList;
  }
});
Object.defineProperty(exports, "Switch", {
  enumerable: true,
  get: function () {
    return _solidJs.Switch;
  }
});
Object.defineProperty(exports, "assignProps", {
  enumerable: true,
  get: function () {
    return _solidJs.assignProps;
  }
});
Object.defineProperty(exports, "createComponent", {
  enumerable: true,
  get: function () {
    return _solidJs.createComponent;
  }
});
Object.defineProperty(exports, "currentContext", {
  enumerable: true,
  get: function () {
    return _solidJs.getContextOwner;
  }
});
Object.defineProperty(exports, "effect", {
  enumerable: true,
  get: function () {
    return _solidJs.createRenderEffect;
  }
});
exports.isServer = exports.SVGNamespace = exports.SVGElements = exports.Properties = exports.NonComposedEvents = exports.ChildProperties = exports.Aliases = void 0;

var _solidJs = require("solid-js");

const booleans = ["allowfullscreen", "allowpaymentrequest", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "ismap", "itemscope", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected", "truespeed"];
const Properties = new Set(["className", "indeterminate", "value", ...booleans]);
exports.Properties = Properties;
const ChildProperties = new Set(["innerHTML", "textContent", "innerText", "children"]);
exports.ChildProperties = ChildProperties;
const Aliases = {
  className: "class",
  htmlFor: "for"
};
exports.Aliases = Aliases;
const NonComposedEvents = new Set(["abort", "animationstart", "animationend", "animationiteration", "blur", "change", "copy", "cut", "error", "focus", "gotpointercapture", "load", "loadend", "loadstart", "lostpointercapture", "mouseenter", "mouseleave", "paste", "pointerenter", "pointerleave", "progress", "reset", "scroll", "select", "submit", "toggle", "transitionstart", "transitioncancel", "transitionend", "transitionrun"]);
exports.NonComposedEvents = NonComposedEvents;
const SVGElements = new Set(["altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor", "animateMotion", "animateTransform", "circle", "clipPath", "color-profile", "cursor", "defs", "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "font", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignObject", "g", "glyph", "glyphRef", "hkern", "image", "line", "linearGradient", "marker", "mask", "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "set", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use", "view", "vkern"]);
exports.SVGElements = SVGElements;
const SVGNamespace = {
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace"
};
exports.SVGNamespace = SVGNamespace;

function memo(fn, equal) {
  return (0, _solidJs.createMemo)(fn, undefined, equal);
}

function dynamicProperty(props, key) {
  const src = props[key];
  Object.defineProperty(props, key, {
    get() {
      return src();
    },

    enumerable: true
  });
  return props;
}

function getHydrationKey() {
  return globalThis._$HYDRATION.context.id;
}

function reconcileArrays(parentNode, a, b) {
  let bLength = b.length,
      aEnd = a.length,
      bEnd = bLength,
      aStart = 0,
      bStart = 0,
      after = a[aEnd - 1].nextSibling,
      map = null;

  while (aStart < aEnd || bStart < bEnd) {
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;

      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) parentNode.removeChild(a[aStart]);
        aStart++;
      }
    } else if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
    } else if (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = new Map();
        let i = bStart;

        while (i < bEnd) map.set(b[i], i++);
      }

      const index = map.get(a[aStart]);

      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
              sequence = 1,
              t;

          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }

          if (sequence > index - bStart) {
            const node = a[aStart];

            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else parentNode.removeChild(a[aStart++]);
    }
  }
}

const eventRegistry = new Set();
let hydration = null;

function render(code, element, init) {
  let disposer;
  (0, _solidJs.createRoot)(dispose => {
    disposer = dispose;
    insert(element, code(), element.firstChild ? null : undefined, init);
  });
  return () => {
    disposer();
    element.textContent = "";
  };
}

function template(html, check, isSVG) {
  const t = document.createElement("template");
  t.innerHTML = html;
  if (check && t.innerHTML.split("<").length - 1 !== check) throw `Template html does not match input:\n${t.innerHTML}\n\n${html}`;
  let node = t.content.firstChild;
  if (isSVG) node = node.firstChild;
  return node;
}

function delegateEvents(eventNames) {
  for (let i = 0, l = eventNames.length; i < l; i++) {
    const name = eventNames[i];

    if (!eventRegistry.has(name)) {
      eventRegistry.add(name);
      document.addEventListener(name, eventHandler);
    }
  }
}

function clearDelegatedEvents() {
  for (let name of eventRegistry.keys()) document.removeEventListener(name, eventHandler);

  eventRegistry.clear();
}

function setAttribute(node, name, value) {
  if (value === false || value == null) node.removeAttribute(name);else node.setAttribute(name, value);
}

function setAttributeNS(node, namespace, name, value) {
  if (value === false || value == null) node.removeAttributeNS(namespace, name);else node.setAttributeNS(namespace, name, value);
}

function classList(node, value, prev) {
  const classKeys = Object.keys(value);

  for (let i = 0, len = classKeys.length; i < len; i++) {
    const key = classKeys[i],
          classValue = !!value[key],
          classNames = key.split(/\s+/);
    if (!key || prev && prev[key] === classValue) continue;

    for (let j = 0, nameLen = classNames.length; j < nameLen; j++) node.classList.toggle(classNames[j], classValue);
  }

  return value;
}

function style(node, value, prev) {
  const nodeStyle = node.style;
  if (typeof value === "string") return nodeStyle.cssText = value;
  let v, s;

  if (prev != null && typeof prev !== "string") {
    for (s in value) {
      v = value[s];
      v !== prev[s] && nodeStyle.setProperty(s, v);
    }

    for (s in prev) {
      value[s] == null && nodeStyle.removeProperty(s);
    }
  } else {
    for (s in value) nodeStyle.setProperty(s, value[s]);
  }

  return value;
}

function spread(node, accessor, isSVG, skipChildren) {
  if (typeof accessor === "function") {
    (0, _solidJs.createRenderEffect)(current => spreadExpression(node, accessor(), current, isSVG, skipChildren));
  } else spreadExpression(node, accessor, undefined, isSVG, skipChildren);
}

function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) initial = [];
  if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
  (0, _solidJs.createRenderEffect)(current => insertExpression(parent, accessor(), current, marker), initial);
}

function assign(node, props, isSVG, skipChildren, prevProps = {}) {
  let isCE, isProp, isChildProp;

  for (const prop in props) {
    if (prop === "children") {
      if (!skipChildren) insertExpression(node, props.children);
      continue;
    }

    const value = props[prop];
    if (value === prevProps[prop]) continue;

    if (prop === "style") {
      style(node, value, prevProps[prop]);
    } else if (prop === "class" && !isSVG) {
      node.className = value;
    } else if (prop === "classList") {
      classList(node, value, prevProps[prop]);
    } else if (prop === "ref") {
      value(node);
    } else if (prop === "on") {
      for (const eventName in value) node.addEventListener(eventName, value[eventName]);
    } else if (prop === "onCapture") {
      for (const eventName in value) node.addEventListener(eventName, value[eventName], true);
    } else if (prop.slice(0, 2) === "on") {
      const lc = prop.toLowerCase();

      if (!NonComposedEvents.has(lc.slice(2))) {
        const name = lc.slice(2);

        if (Array.isArray(value)) {
          node[`__${name}`] = value[0];
          node[`__${name}Data`] = value[1];
        } else node[`__${name}`] = value;

        delegateEvents([name]);
      } else node[lc] = value;
    } else if ((isChildProp = ChildProperties.has(prop)) || !isSVG && (isProp = Properties.has(prop)) || (isCE = node.nodeName.includes("-"))) {
      if (isCE && !isProp && !isChildProp) node[toPropertyName(prop)] = value;else node[prop] = value;
    } else {
      const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
      if (ns) setAttributeNS(node, ns, prop, value);else setAttribute(node, Aliases[prop] || prop, value);
    }

    prevProps[prop] = value;
  }
}

function hydrate(code, element) {
  hydration = globalThis._$HYDRATION || (globalThis._$HYDRATION = {});
  hydration.context = {
    id: "0",
    count: 0,
    registry: {}
  };
  const templates = element.querySelectorAll(`*[data-hk]`);
  Array.prototype.reduce.call(templates, (memo, node) => {
    const id = node.getAttribute("data-hk"),
          list = memo[id] || (memo[id] = []);
    list.push(node);
    return memo;
  }, hydration.context.registry);
  const dispose = render(code, element, [...element.childNodes]);
  delete hydration.context;
  return dispose;
}

function getNextElement(template, isSSR) {
  const hydrate = hydration && hydration.context;
  let node, key;

  if (!hydrate || !hydrate.registry || !((key = getHydrationKey()) && hydrate.registry[key] && (node = hydrate.registry[key].shift()))) {
    const el = template.cloneNode(true);
    if (isSSR && hydrate) el.setAttribute("data-hk", getHydrationKey());
    return el;
  }

  if (hydration && hydration.completed) hydration.completed.add(node);
  return node;
}

function getNextMarker(start) {
  let end = start,
      count = 0,
      current = [];

  if (hydration && hydration.context && hydration.context.registry) {
    while (end) {
      if (end.nodeType === 8) {
        const v = end.nodeValue;
        if (v === "#") count++;else if (v === "/") {
          if (count === 0) return [end, current];
          count--;
        }
      }

      current.push(end);
      end = end.nextSibling;
    }
  }

  return [end, current];
}

function runHydrationEvents() {
  if (hydration.events) {
    const {
      completed,
      events
    } = hydration;

    while (events.length) {
      const [el, e] = events[0];
      if (!completed.has(el)) return;
      eventHandler(e);
      events.shift();
    }
  }
}

function toPropertyName(name) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}

function eventHandler(e) {
  const key = `__${e.type}`;
  let node = e.composedPath && e.composedPath()[0] || e.target;

  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }

  Object.defineProperty(e, "currentTarget", {
    configurable: true,

    get() {
      return node;
    }

  });

  while (node !== null) {
    const handler = node[key];

    if (handler) {
      const data = node[`${key}Data`];
      data !== undefined ? handler(data, e) : handler(e);
      if (e.cancelBubble) return;
    }

    node = node.host && node.host !== node && node.host instanceof Node ? node.host : node.parentNode;
  }
}

function spreadExpression(node, props, prevProps = {}, isSVG, skipChildren) {
  if (!skipChildren && "children" in props) {
    (0, _solidJs.createRenderEffect)(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
  }

  (0, _solidJs.createRenderEffect)(() => assign(node, props, isSVG, true, prevProps));
  return prevProps;
}

function insertExpression(parent, value, current, marker, unwrapArray) {
  while (typeof current === "function") current = current();

  if (value === current) return current;
  const t = typeof value,
        multi = marker !== undefined;
  parent = multi && current[0] && current[0].parentNode || parent;

  if (t === "string" || t === "number") {
    if (t === "number") value = value.toString();

    if (multi) {
      let node = current[0];

      if (node && node.nodeType === 3) {
        node.data = value;
      } else node = document.createTextNode(value);

      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    if (hydration && hydration.context && hydration.context.registry) return current;
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    (0, _solidJs.createRenderEffect)(() => current = insertExpression(parent, value(), current, marker));
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];

    if (normalizeIncomingArray(array, value, unwrapArray)) {
      (0, _solidJs.createRenderEffect)(() => current = insertExpression(parent, array, current, marker, true));
      return () => current;
    }

    if (hydration && hydration.context && hydration.context.registry && current.length) return current;

    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi) return current;
    } else {
      if (Array.isArray(current)) {
        if (current.length === 0) {
          appendNodes(parent, array, marker);
        } else reconcileArrays(parent, current, array);
      } else if (current == null || current === "") {
        appendNodes(parent, array);
      } else {
        reconcileArrays(parent, multi && current || [parent.firstChild], array);
      }
    }

    current = array;
  } else if (value instanceof Node) {
    if (Array.isArray(current)) {
      if (multi) return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);

    current = value;
  } else console.warn(`Skipped inserting`, value);

  return current;
}

function normalizeIncomingArray(normalized, array, unwrap) {
  let dynamic = false;

  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
        t;

    if (item instanceof Node) {
      normalized.push(item);
    } else if (item == null || item === true || item === false) ;else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item) || dynamic;
    } else if ((t = typeof item) === "string") {
      normalized.push(document.createTextNode(item));
    } else if (t === "function") {
      if (unwrap) {
        const idx = item();
        dynamic = normalizeIncomingArray(normalized, Array.isArray(idx) ? idx : [idx]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else normalized.push(document.createTextNode(item.toString()));
  }

  return dynamic;
}

function appendNodes(parent, array, marker) {
  for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}

function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined) return parent.textContent = "";
  const node = replacement || document.createTextNode("");

  if (current.length) {
    let inserted = false;

    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];

      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);else isParent && parent.removeChild(el);
      } else inserted = true;
    }
  } else parent.insertBefore(node, marker);

  return [node];
}

function renderToString(fn, options) {}

function renderToNodeStream(fn) {}

function renderToWebStream(fn) {}

function ssr(template, ...nodes) {}

function resolveSSRNode(node) {}

function ssrClassList(value) {}

function ssrStyle(value) {}

function ssrSpread(accessor) {}

function ssrBoolean(key, value) {}

function escape(html) {}

function generateHydrationScript(options) {}

const isServer = false;
exports.isServer = isServer;

function Portal(props) {
  const hydration = globalThis._$HYDRATION;
  const {
    useShadow
  } = props,
        marker = document.createTextNode(""),
        mount = props.mount || document.body;

  function renderPortal() {
    if (hydration && hydration.context && hydration.context.registry) {
      const [s, set] = (0, _solidJs.createSignal)(false);
      queueMicrotask(() => set(true));
      return () => s() && props.children;
    } else return () => props.children;
  }

  if (mount instanceof HTMLHeadElement) {
    insert(mount, renderPortal(), null);
  } else {
    const container = props.isSVG ? document.createElementNS("http://www.w3.org/2000/svg", "g") : document.createElement("div"),
          renderRoot = useShadow && container.attachShadow ? container.attachShadow({
      mode: "open"
    }) : container;
    Object.defineProperty(container, "host", {
      get() {
        return marker.parentNode;
      }

    });
    insert(renderRoot, renderPortal());
    mount.appendChild(container);
    props.ref && props.ref(container);
    (0, _solidJs.onCleanup)(() => mount.removeChild(container));
  }

  return marker;
}

function Dynamic(props) {
  const [p, others] = (0, _solidJs.splitProps)(props, ["component"]);
  return (0, _solidJs.createMemo)(() => {
    const comp = p.component,
          t = typeof comp;

    if (comp) {
      if (t === "function") return (0, _solidJs.untrack)(() => comp(others));else if (t === "string") {
        const el = document.createElement(comp);
        spread(el, others);
        return el;
      }
    }
  });
}
},{"solid-js":"node_modules/solid-js/dist/solid.js"}],"node_modules/solid-typefu-router5/dist/index.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MatchRoute = MatchRoute;
exports.ShowRoute = ShowRoute;
exports.SwitchRoutes = SwitchRoutes;
exports.isActive = isActive;
exports.useIsActive = useIsActive;
exports.useRoute = useRoute;
exports.Context = exports.default = void 0;

var _web = require("solid-js/web");

var _solidJs = require("solid-js");

const Context = (0, _solidJs.createContext)();
exports.Context = Context;

function useRoute() {
  const ctx = (0, _solidJs.useContext)(Context);
  return () => ctx.state.route;
}

function paramsEq(a, b) {
  if (a === b) return true;
  if (a === undefined) return b === undefined;
  if (b === undefined) return a === undefined;
  const keys = Object.keys(a);

  for (const key of keys) if (!(key in b)) return false;

  for (const key of keys) if (String(a[key]) !== String(b[key])) return false;

  return keys.length === Object.keys(b).length;
}

function useIsActive(link, params, paramsIsEqual = paramsEq) {
  const state = (0, _solidJs.useContext)(Context).state;
  const getIsActiveByName = (0, _solidJs.createMemo)(() => isActive(state.route.name, link));
  return (0, _solidJs.createMemo)(() => getIsActiveByName() && params !== undefined ? paramsIsEqual(state.route.params, params) : true);
}
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */


function isActive(here, link) {
  return link.startsWith(here);
}

const _tmpl$ = (0, _web.template)(`<button></button>`, 2),
      _tmpl$2 = (0, _web.template)(`<a></a>`, 2);

function Link(props) {
  const {
    router: router5,
    config
  } = (0, _solidJs.useContext)(Context);
  let [linkProps, innerProps] = (0, _solidJs.splitProps)(props, ["type", "onClick", "classList", "to", "params", "nav", "navIgnoreParams", "navActiveClass", "disabled", "back", "forward", "display"]);
  linkProps = (0, _solidJs.assignProps)({
    navActiveClass: config.navActiveClass,
    back: config.back,
    forward: config.forward
  }, linkProps);
  const isActive = typeof linkProps.to === "string" ? useIsActive(linkProps.to, linkProps.navIgnoreParams ? undefined : linkProps.params) : alwaysInactive;
  const getHref = (0, _solidJs.createMemo)(() => {
    if (typeof linkProps.to === "string" && !linkProps.to.startsWith("@@")) {
      try {
        return router5.buildPath(linkProps.to, linkProps.params);
      } catch (err) {
        console.warn("<Link> buildPath failed:", err);
      }
    }

    return undefined;
  });
  const getClassList = (0, _solidJs.createMemo)(() => {
    const cls = { ...linkProps.classList
    };

    if (typeof linkProps.navActiveClass === "string") {
      cls[linkProps.navActiveClass] = isActive();
    }

    return cls;
  });

  function onClick(ev) {
    var _linkProps$forward, _linkProps, _linkProps$back, _linkProps2, _linkProps$params;

    ev.preventDefault();

    switch (linkProps.to) {
      case "@@forward":
        (_linkProps$forward = (_linkProps = linkProps).forward) === null || _linkProps$forward === void 0 ? void 0 : _linkProps$forward.call(_linkProps);
        break;

      case "@@back":
        (_linkProps$back = (_linkProps2 = linkProps).back) === null || _linkProps$back === void 0 ? void 0 : _linkProps$back.call(_linkProps2);
        break;

      default:
        router5.navigate(linkProps.to, (_linkProps$params = linkProps.params) !== null && _linkProps$params !== void 0 ? _linkProps$params : {});
        if (typeof linkProps.onClick === "function") linkProps.onClick(ev);
        break;
    }

    ev.target.blur();
  }

  return () => linkProps.display === "button" ? (() => {
    const _el$ = _tmpl$.cloneNode(true);

    _el$.__click = onClick;
    (0, _web.spread)(_el$, innerProps, false, false);
    (0, _web.effect)(_p$ => {
      const _v$ = linkProps.disabled,
            _v$2 = getClassList();

      _v$ !== _p$._v$ && (_el$.disabled = _p$._v$ = _v$);
      _p$._v$2 = (0, _web.classList)(_el$, _v$2, _p$._v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });
    return _el$;
  })() : linkProps.to.startsWith("@@") ? (() => {
    const _el$2 = _tmpl$.cloneNode(true);

    _el$2.__click = onClick;
    (0, _web.spread)(_el$2, innerProps, false, false);
    (0, _web.effect)(_$p => (0, _web.classList)(_el$2, getClassList(), _$p));
    return _el$2;
  })() : (() => {
    const _el$3 = _tmpl$2.cloneNode(true);

    _el$3.__click = onClick;
    (0, _web.spread)(_el$3, innerProps, false, false);
    (0, _web.effect)(_p$ => {
      const _v$3 = getClassList(),
            _v$4 = getHref();

      _p$._v$3 = (0, _web.classList)(_el$3, _v$3, _p$._v$3);
      _v$4 !== _p$._v$4 && (0, _web.setAttribute)(_el$3, "href", _p$._v$4 = _v$4);
      return _p$;
    }, {
      _v$3: undefined,
      _v$4: undefined
    });
    return _el$3;
  })();
}

const alwaysInactive = () => false;

(0, _web.delegateEvents)(["click"]);
const MatchContext = (0, _solidJs.createContext)("");

function doesMatch(ctx, here, props) {
  const suffix = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const target = ctx !== "" ? `${ctx}.${suffix}` : suffix;
  return [target, exact ? here === target : here.startsWith(target)];
}
/**
 * Not reactive on the routes being used
 *
 * Prefer this over [[Switch]] + [[MatchRoute]]
 */


function SwitchRoutes(props) {
  const ctx = (0, _solidJs.useContext)(MatchContext);
  const route = useRoute();
  const getIndex = (0, _solidJs.createMemo)(() => {
    const here = route().name;
    const children = props.children;

    for (let i = 0; i < children.length; i++) {
      const [target, when] = doesMatch(ctx, here, children[i]);
      if (when) return [i, target];
    }

    return undefined;
  }, undefined, (a, b) => {
    const same = a === b || a !== undefined && b !== undefined && a[0] === b[0];
    return same;
  });
  return (0, _solidJs.createMemo)(() => {
    const ix = getIndex();

    if (ix !== undefined) {
      const [i, target] = ix;
      return (0, _web.createComponent)(MatchContext.Provider, {
        value: target,

        get children() {
          return props.children[i].children;
        }

      });
    }

    return props.fallback;
  });
}
/**
 * Create a [[Show]] node against a given route.
 */


function ShowRoute(props) {
  const getMatch = createGetMatch(props);
  return () => {
    const [target, when] = getMatch();
    return (0, _web.createComponent)(_solidJs.Show, {
      when: when,

      get fallback() {
        return props.fallback;
      },

      get children() {
        return (0, _web.createComponent)(MatchContext.Provider, {
          value: target,

          get children() {
            return props.children;
          }

        });
      }

    });
  };
}
/**
 * Create a [[Match]] node against a given route.
 */


function MatchRoute(props) {
  const getMatch = createGetMatch(props);
  return (0, _web.createComponent)(_solidJs.Match, {
    get when() {
      return getMatch()[1];
    },

    get children() {
      return (0, _web.createComponent)(MatchContext.Provider, {
        get value() {
          return getMatch()[0];
        },

        get children() {
          return props.children;
        }

      });
    }

  });
}

function createGetMatch(props) {
  const route = useRoute();
  const ctx = (0, _solidJs.useContext)(MatchContext);
  return (0, _solidJs.createMemo)(() => doesMatch(ctx, route().name, props), undefined, (a, b) => a && a[1] === b[1]);
}
/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */


function RouteStateMachine(tree, _assumed) {
  const route = useRoute();

  function traverse(path, node) {
    const children = [];
    const {
      render: RenderHere = passthru,
      fallback: RenderFallback = nofallback,
      ...routes
    } = node;

    for (const key in routes) {
      const next = [...path, key];
      const child = routes[key];
      children.push({
        prefix: key,
        children: traverse(next, child)
      });
    }

    return () => (0, _web.createComponent)(RenderHere, {
      get params() {
        return route().params;
      },

      get children() {
        return (0, _web.createComponent)(SwitchRoutes, {
          fallback: () => (0, _web.createComponent)(RenderFallback, {
            get params() {
              return route().params;
            }

          }),
          children: children
        });
      }

    });
  }

  return (0, _solidJs.untrack)(() => traverse([], tree));
}

function nofallback() {
  return undefined;
}

function passthru(props) {
  return props.children;
}
/**
 * Create a router for use in solid-js.
 *
 * I'd recommend putting your router in its own file like './router.ts', then
 * exporting the results of this function, like
 *
 * ```ts
 * import { createRouter, Router as Router5 } from 'router5';
 * import { createSolidRouter } from 'solid-ts-router';
 *
 * const routes = [
 *   ...
 * ] as const;
 *
 * // note the "as const" is very important! this causes TypeScript to infer
 * // `routes` as the narrowest possible type.
 *
 * function createRouter5(routes: Route<Deps>[]): Router5 {
 *   return createRouter(...)
 * }
 *
 * function onStart(router: Router5): void {
 *   // initial redirect here
 *   ...
 * }
 *
 * export const { Provider, Link, Router } = createSolidRouter({ routes, createRouter5, onStart });
 * ```
 */


function createSolidRouter(config) {
  let router;
  let unsubs;
  const r = config.createRouter5(config.routes);

  if (Array.isArray(r)) {
    [router, ...unsubs] = r;
  } else {
    router = r;
    unsubs = [];
  }

  return {
    Link,
    navigate: opts => {
      var _config$forward, _config$back, _opts$params;

      switch (opts.to) {
        case "@@forward":
          (_config$forward = config.forward) === null || _config$forward === void 0 ? void 0 : _config$forward.call(config);
          break;

        case "@@back":
          (_config$back = config.back) === null || _config$back === void 0 ? void 0 : _config$back.call(config);
          break;

        default:
          router.navigate(opts.to, (_opts$params = opts.params) !== null && _opts$params !== void 0 ? _opts$params : {});
          break;
      }
    },
    Router: props => RouteStateMachine(props.children, props.assume),
    Provider: props => {
      var _router$getState;

      const initialState = (_router$getState = router.getState()) !== null && _router$getState !== void 0 ? _router$getState : {
        name: ""
      };
      const [state, setState] = (0, _solidJs.createState)({
        route: { ...initialState,
          nameArray: initialState.name.split(".")
        },
        previousRoute: undefined
      });
      router.subscribe(rs => {
        setState((0, _solidJs.produce)(s => {
          s.route = { ...rs.route,
            nameArray: rs.route.name.split(".")
          };
          s.previousRoute = rs.previousRoute;
        }));
      });
      router.start();
      if (typeof config.onStart === "function") config.onStart(router);
      (0, _solidJs.onCleanup)(() => {
        for (const unsub of unsubs) {
          unsub();
        }

        router.stop();
      });
      return (0, _web.createComponent)(Context.Provider, {
        value: {
          state,
          router,
          config
        },

        get children() {
          return props.children;
        }

      });
    },
    router
  };
}

var _default = createSolidRouter;
exports.default = _default;
},{"solid-js/web":"node_modules/solid-js/web/dist/web.js","solid-js":"node_modules/solid-js/dist/solid.js"}],"node_modules/tslib/tslib.es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__extends = __extends;
exports.__rest = __rest;
exports.__decorate = __decorate;
exports.__param = __param;
exports.__metadata = __metadata;
exports.__awaiter = __awaiter;
exports.__generator = __generator;
exports.__createBinding = __createBinding;
exports.__exportStar = __exportStar;
exports.__values = __values;
exports.__read = __read;
exports.__spread = __spread;
exports.__spreadArrays = __spreadArrays;
exports.__await = __await;
exports.__asyncGenerator = __asyncGenerator;
exports.__asyncDelegator = __asyncDelegator;
exports.__asyncValues = __asyncValues;
exports.__makeTemplateObject = __makeTemplateObject;
exports.__importStar = __importStar;
exports.__importDefault = __importDefault;
exports.__classPrivateFieldGet = __classPrivateFieldGet;
exports.__classPrivateFieldSet = __classPrivateFieldSet;
exports.__assign = void 0;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/* global Reflect, Promise */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function () {
  exports.__assign = __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

exports.__assign = __assign;

function __rest(s, e) {
  var t = {};

  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
}

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}

function __createBinding(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
}

function __exportStar(m, exports) {
  for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
}

function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));

  return ar;
}

function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
}

;

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []),
      i,
      q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i;

  function verb(n) {
    if (g[n]) i[n] = function (v) {
      return new Promise(function (a, b) {
        q.push([n, v, a, b]) > 1 || resume(n, v);
      });
    };
  }

  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }

  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }

  function fulfill(value) {
    resume("next", value);
  }

  function reject(value) {
    resume("throw", value);
  }

  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) {
    throw e;
  }), verb("return"), i[Symbol.iterator] = function () {
    return this;
  }, i;

  function verb(n, f) {
    i[n] = o[n] ? function (v) {
      return (p = !p) ? {
        value: __await(o[n](v)),
        done: n === "return"
      } : f ? f(v) : v;
    } : f;
  }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator],
      i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i);

  function verb(n) {
    i[n] = o[n] && function (v) {
      return new Promise(function (resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }

  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function (v) {
      resolve({
        value: v,
        done: d
      });
    }, reject);
  }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", {
      value: raw
    });
  } else {
    cooked.raw = raw;
  }

  return cooked;
}

;

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result.default = mod;
  return result;
}

function __importDefault(mod) {
  return mod && mod.__esModule ? mod : {
    default: mod
  };
}

function __classPrivateFieldGet(receiver, privateMap) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }

  return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to set private field on non-instance");
  }

  privateMap.set(receiver, value);
  return value;
}
},{}],"node_modules/search-params/dist/search-params.esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = exports.omit = exports.keep = exports.build = void 0;

var makeOptions = function makeOptions(opts) {
  if (opts === void 0) {
    opts = {};
  }

  return {
    arrayFormat: opts.arrayFormat || 'none',
    booleanFormat: opts.booleanFormat || 'none',
    nullFormat: opts.nullFormat || 'default'
  };
};

var encodeValue = function encodeValue(value) {
  return encodeURIComponent(value);
};

var decodeValue = function decodeValue(value) {
  return decodeURIComponent(value);
};

var encodeBoolean = function encodeBoolean(name, value, opts) {
  if (opts.booleanFormat === 'empty-true' && value) {
    return name;
  }

  var encodedValue;

  if (opts.booleanFormat === 'unicode') {
    encodedValue = value ? '✓' : '✗';
  } else {
    encodedValue = value.toString();
  }

  return name + "=" + encodedValue;
};

var encodeNull = function encodeNull(name, opts) {
  if (opts.nullFormat === 'hidden') {
    return '';
  }

  if (opts.nullFormat === 'string') {
    return name + "=null";
  }

  return name;
};

var getNameEncoder = function getNameEncoder(opts) {
  if (opts.arrayFormat === 'index') {
    return function (name, index) {
      return name + "[" + index + "]";
    };
  }

  if (opts.arrayFormat === 'brackets') {
    return function (name) {
      return name + "[]";
    };
  }

  return function (name) {
    return name;
  };
};

var encodeArray = function encodeArray(name, arr, opts) {
  var encodeName = getNameEncoder(opts);
  return arr.map(function (val, index) {
    return encodeName(name, index) + "=" + encodeValue(val);
  }).join('&');
};

var encode = function encode(name, value, opts) {
  if (value === null) {
    return encodeNull(name, opts);
  }

  if (typeof value === 'boolean') {
    return encodeBoolean(name, value, opts);
  }

  if (Array.isArray(value)) {
    return encodeArray(name, value, opts);
  }

  return name + "=" + encodeValue(value);
};

var decode = function decode(value, opts) {
  if (value === undefined) {
    return opts.booleanFormat === 'empty-true' ? true : null;
  }

  if (opts.booleanFormat === 'string') {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }
  }

  if (opts.booleanFormat === 'unicode') {
    if (decodeValue(value) === '✓') {
      return true;
    }

    if (decodeValue(value) === '✗') {
      return false;
    }
  }

  if (opts.nullFormat === 'string') {
    if (value === 'null') {
      return null;
    }
  }

  return decodeValue(value);
};

var getSearch = function getSearch(path) {
  var pos = path.indexOf('?');

  if (pos === -1) {
    return path;
  }

  return path.slice(pos + 1);
};

var isSerialisable = function isSerialisable(val) {
  return val !== undefined;
};

var parseName = function parseName(name) {
  var bracketPosition = name.indexOf('[');
  var hasBrackets = bracketPosition !== -1;
  return {
    hasBrackets: hasBrackets,
    name: hasBrackets ? name.slice(0, bracketPosition) : name
  };
};
/**
 * Parse a querystring and return an object of parameters
 */


var parse = function parse(path, opts) {
  var options = makeOptions(opts);
  return getSearch(path).split('&').reduce(function (params, param) {
    var _a = param.split('='),
        rawName = _a[0],
        value = _a[1];

    var _b = parseName(rawName),
        hasBrackets = _b.hasBrackets,
        name = _b.name;

    var currentValue = params[name];
    var decodedValue = decode(value, options);

    if (currentValue === undefined) {
      params[name] = hasBrackets ? [decodedValue] : decodedValue;
    } else {
      params[name] = (Array.isArray(currentValue) ? currentValue : [currentValue]).concat(decodedValue);
    }

    return params;
  }, {});
};
/**
 * Build a querystring from an object of parameters
 */


exports.parse = parse;

var build = function build(params, opts) {
  var options = makeOptions(opts);
  return Object.keys(params).filter(function (paramName) {
    return isSerialisable(params[paramName]);
  }).map(function (paramName) {
    return encode(paramName, params[paramName], options);
  }).filter(Boolean).join('&');
};
/**
 * Remove a list of parameters from a querystring
 */


exports.build = build;

var omit = function omit(path, paramsToOmit, opts) {
  var options = makeOptions(opts);
  var searchPart = getSearch(path);

  if (searchPart === '') {
    return {
      querystring: '',
      removedParams: {}
    };
  }

  var _a = path.split('&').reduce(function (_a, chunk) {
    var left = _a[0],
        right = _a[1];
    var rawName = chunk.split('=')[0];
    var name = parseName(rawName).name;
    return paramsToOmit.indexOf(name) === -1 ? [left.concat(chunk), right] : [left, right.concat(chunk)];
  }, [[], []]),
      kept = _a[0],
      removed = _a[1];

  return {
    querystring: kept.join('&'),
    removedParams: parse(removed.join('&'), options)
  };
};
/**
 * Remove a list of parameters from a querystring
 */


exports.omit = omit;

var keep = function keep(path, paramsToKeep, opts) {
  var options = makeOptions(opts);
  var searchPart = getSearch(path);

  if (searchPart === '') {
    return {
      keptParams: {},
      querystring: ''
    };
  }

  var kept = path.split('&').reduce(function (acc, chunk) {
    var rawName = chunk.split('=')[0];
    var name = parseName(rawName).name;

    if (paramsToKeep.includes(name)) {
      acc.push(chunk);
    }

    return acc;
  }, []);
  return {
    keptParams: parse(kept.join('&'), options),
    querystring: kept.join('&')
  };
};

exports.keep = keep;
},{}],"node_modules/path-parser/dist/path-parser.esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Path = void 0;

var _tslib = require("tslib");

var _searchParams = require("search-params");

/**
 * We encode using encodeURIComponent but we want to
 * preserver certain characters which are commonly used
 * (sub delimiters and ':')
 *
 * https://www.ietf.org/rfc/rfc3986.txt
 *
 * reserved    = gen-delims / sub-delims
 *
 * gen-delims  = ":" / "/" / "?" / "#" / "[" / "]" / "@"
 *
 * sub-delims  = "!" / "$" / "&" / "'" / "(" / ")"
              / "*" / "+" / "," / ";" / "="
 */
var excludeSubDelimiters = /[^!$'()*+,;|:]/g;

var encodeURIComponentExcludingSubDelims = function encodeURIComponentExcludingSubDelims(segment) {
  return segment.replace(excludeSubDelimiters, function (match) {
    return encodeURIComponent(match);
  });
};

var encodingMethods = {
  "default": encodeURIComponentExcludingSubDelims,
  uri: encodeURI,
  uriComponent: encodeURIComponent,
  none: function none(val) {
    return val;
  },
  legacy: encodeURI
};
var decodingMethods = {
  "default": decodeURIComponent,
  uri: decodeURI,
  uriComponent: decodeURIComponent,
  none: function none(val) {
    return val;
  },
  legacy: decodeURIComponent
};

var encodeParam = function encodeParam(param, encoding, isSpatParam) {
  var encoder = encodingMethods[encoding] || encodeURIComponentExcludingSubDelims;

  if (isSpatParam) {
    return String(param).split('/').map(encoder).join('/');
  }

  return encoder(String(param));
};

var decodeParam = function decodeParam(param, encoding) {
  return (decodingMethods[encoding] || decodeURIComponent)(param);
};

var defaultOrConstrained = function defaultOrConstrained(match) {
  return '(' + (match ? match.replace(/(^<|>$)/g, '') : "[a-zA-Z0-9-_.~%':|=+\\*@$]+") + ')';
};

var rules = [{
  name: 'url-parameter',
  pattern: /^:([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})(<(.+?)>)?/,
  regex: function regex(match) {
    return new RegExp(defaultOrConstrained(match[2]));
  }
}, {
  name: 'url-parameter-splat',
  pattern: /^\*([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})/,
  regex: /([^?]*)/
}, {
  name: 'url-parameter-matrix',
  pattern: /^;([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})(<(.+?)>)?/,
  regex: function regex(match) {
    return new RegExp(';' + match[1] + '=' + defaultOrConstrained(match[2]));
  }
}, {
  name: 'query-parameter',
  pattern: /^(?:\?|&)(?::)?([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})/
}, {
  name: 'delimiter',
  pattern: /^(\/|\?)/,
  regex: function regex(match) {
    return new RegExp('\\' + match[0]);
  }
}, {
  name: 'sub-delimiter',
  pattern: /^(!|&|-|_|\.|;)/,
  regex: function regex(match) {
    return new RegExp(match[0]);
  }
}, {
  name: 'fragment',
  pattern: /^([0-9a-zA-Z]+)/,
  regex: function regex(match) {
    return new RegExp(match[0]);
  }
}];

var tokenise = function tokenise(str, tokens) {
  if (tokens === void 0) {
    tokens = [];
  } // Look for a matching rule


  var matched = rules.some(function (rule) {
    var match = str.match(rule.pattern);

    if (!match) {
      return false;
    }

    tokens.push({
      type: rule.name,
      match: match[0],
      val: match.slice(1, 2),
      otherVal: match.slice(2),
      regex: rule.regex instanceof Function ? rule.regex(match) : rule.regex
    });

    if (match[0].length < str.length) {
      tokens = tokenise(str.substr(match[0].length), tokens);
    }

    return true;
  }); // If no rules matched, throw an error (possible malformed path)

  if (!matched) {
    throw new Error("Could not parse path '" + str + "'");
  }

  return tokens;
};

var exists = function exists(val) {
  return val !== undefined && val !== null;
};

var optTrailingSlash = function optTrailingSlash(source, strictTrailingSlash) {
  if (strictTrailingSlash) {
    return source;
  }

  if (source === '\\/') {
    return source;
  }

  return source.replace(/\\\/$/, '') + '(?:\\/)?';
};

var upToDelimiter = function upToDelimiter(source, delimiter) {
  if (!delimiter) {
    return source;
  }

  return /(\/)$/.test(source) ? source : source + '(\\/|\\?|\\.|;|$)';
};

var appendQueryParam = function appendQueryParam(params, param, val) {
  if (val === void 0) {
    val = '';
  }

  var existingVal = params[param];

  if (existingVal === undefined) {
    params[param] = val;
  } else {
    params[param] = Array.isArray(existingVal) ? existingVal.concat(val) : [existingVal, val];
  }

  return params;
};

var defaultOptions = {
  urlParamsEncoding: 'default'
};

var Path =
/*#__PURE__*/

/** @class */
function () {
  function Path(path, options) {
    if (!path) {
      throw new Error('Missing path in Path constructor');
    }

    this.path = path;
    this.options = (0, _tslib.__assign)((0, _tslib.__assign)({}, defaultOptions), options);
    this.tokens = tokenise(path);
    this.hasUrlParams = this.tokens.filter(function (t) {
      return /^url-parameter/.test(t.type);
    }).length > 0;
    this.hasSpatParam = this.tokens.filter(function (t) {
      return /splat$/.test(t.type);
    }).length > 0;
    this.hasMatrixParams = this.tokens.filter(function (t) {
      return /matrix$/.test(t.type);
    }).length > 0;
    this.hasQueryParams = this.tokens.filter(function (t) {
      return /^query-parameter/.test(t.type);
    }).length > 0; // Extract named parameters from tokens

    this.spatParams = this.getParams('url-parameter-splat');
    this.urlParams = this.getParams(/^url-parameter/); // Query params

    this.queryParams = this.getParams('query-parameter'); // All params

    this.params = this.urlParams.concat(this.queryParams); // Check if hasQueryParams
    // Regular expressions for url part only (full and partial match)

    this.source = this.tokens.filter(function (t) {
      return t.regex !== undefined;
    }).map(function (t) {
      return t.regex.source;
    }).join('');
  }

  Path.createPath = function (path, options) {
    return new Path(path, options);
  };

  Path.prototype.isQueryParam = function (name) {
    return this.queryParams.indexOf(name) !== -1;
  };

  Path.prototype.isSpatParam = function (name) {
    return this.spatParams.indexOf(name) !== -1;
  };

  Path.prototype.test = function (path, opts) {
    var _this = this;

    var options = (0, _tslib.__assign)((0, _tslib.__assign)({
      caseSensitive: false,
      strictTrailingSlash: false
    }, this.options), opts); // trailingSlash: falsy => non optional, truthy => optional

    var source = optTrailingSlash(this.source, options.strictTrailingSlash); // Check if exact match

    var match = this.urlTest(path, source + (this.hasQueryParams ? '(\\?.*$|$)' : '$'), options.caseSensitive, options.urlParamsEncoding); // If no match, or no query params, no need to go further

    if (!match || !this.hasQueryParams) {
      return match;
    } // Extract query params


    var queryParams = (0, _searchParams.parse)(path, options.queryParams);
    var unexpectedQueryParams = Object.keys(queryParams).filter(function (p) {
      return !_this.isQueryParam(p);
    });

    if (unexpectedQueryParams.length === 0) {
      // Extend url match
      Object.keys(queryParams).forEach( // @ts-ignore
      function (p) {
        return match[p] = queryParams[p];
      });
      return match;
    }

    return null;
  };

  Path.prototype.partialTest = function (path, opts) {
    var _this = this;

    var options = (0, _tslib.__assign)((0, _tslib.__assign)({
      caseSensitive: false,
      delimited: true
    }, this.options), opts); // Check if partial match (start of given path matches regex)
    // trailingSlash: falsy => non optional, truthy => optional

    var source = upToDelimiter(this.source, options.delimited);
    var match = this.urlTest(path, source, options.caseSensitive, options.urlParamsEncoding);

    if (!match) {
      return match;
    }

    if (!this.hasQueryParams) {
      return match;
    }

    var queryParams = (0, _searchParams.parse)(path, options.queryParams);
    Object.keys(queryParams).filter(function (p) {
      return _this.isQueryParam(p);
    }).forEach(function (p) {
      return appendQueryParam(match, p, queryParams[p]);
    });
    return match;
  };

  Path.prototype.build = function (params, opts) {
    var _this = this;

    if (params === void 0) {
      params = {};
    }

    var options = (0, _tslib.__assign)((0, _tslib.__assign)({
      ignoreConstraints: false,
      ignoreSearch: false,
      queryParams: {}
    }, this.options), opts);
    var encodedUrlParams = Object.keys(params).filter(function (p) {
      return !_this.isQueryParam(p);
    }).reduce(function (acc, key) {
      if (!exists(params[key])) {
        return acc;
      }

      var val = params[key];

      var isSpatParam = _this.isSpatParam(key);

      if (typeof val === 'boolean') {
        acc[key] = val;
      } else if (Array.isArray(val)) {
        acc[key] = val.map(function (v) {
          return encodeParam(v, options.urlParamsEncoding, isSpatParam);
        });
      } else {
        acc[key] = encodeParam(val, options.urlParamsEncoding, isSpatParam);
      }

      return acc;
    }, {}); // Check all params are provided (not search parameters which are optional)

    if (this.urlParams.some(function (p) {
      return !exists(params[p]);
    })) {
      var missingParameters = this.urlParams.filter(function (p) {
        return !exists(params[p]);
      });
      throw new Error("Cannot build path: '" + this.path + "' requires missing parameters { " + missingParameters.join(', ') + ' }');
    } // Check constraints


    if (!options.ignoreConstraints) {
      var constraintsPassed = this.tokens.filter(function (t) {
        return /^url-parameter/.test(t.type) && !/-splat$/.test(t.type);
      }).every(function (t) {
        return new RegExp('^' + defaultOrConstrained(t.otherVal[0]) + '$').test(encodedUrlParams[t.val]);
      });

      if (!constraintsPassed) {
        throw new Error("Some parameters of '" + this.path + "' are of invalid format");
      }
    }

    var base = this.tokens.filter(function (t) {
      return /^query-parameter/.test(t.type) === false;
    }).map(function (t) {
      if (t.type === 'url-parameter-matrix') {
        return ";" + t.val + "=" + encodedUrlParams[t.val[0]];
      }

      return /^url-parameter/.test(t.type) ? encodedUrlParams[t.val[0]] : t.match;
    }).join('');

    if (options.ignoreSearch) {
      return base;
    }

    var searchParams = this.queryParams.filter(function (p) {
      return Object.keys(params).indexOf(p) !== -1;
    }).reduce(function (sparams, paramName) {
      sparams[paramName] = params[paramName];
      return sparams;
    }, {});
    var searchPart = (0, _searchParams.build)(searchParams, options.queryParams);
    return searchPart ? base + '?' + searchPart : base;
  };

  Path.prototype.getParams = function (type) {
    var predicate = type instanceof RegExp ? function (t) {
      return type.test(t.type);
    } : function (t) {
      return t.type === type;
    };
    return this.tokens.filter(predicate).map(function (t) {
      return t.val[0];
    });
  };

  Path.prototype.urlTest = function (path, source, caseSensitive, urlParamsEncoding) {
    var _this = this;

    var regex = new RegExp('^' + source, caseSensitive ? '' : 'i');
    var match = path.match(regex);

    if (!match) {
      return null;
    } else if (!this.urlParams.length) {
      return {};
    } // Reduce named params to key-value pairs


    return match.slice(1, this.urlParams.length + 1).reduce(function (params, m, i) {
      params[_this.urlParams[i]] = decodeParam(m, urlParamsEncoding);
      return params;
    }, {});
  };

  return Path;
}();

exports.Path = Path;
},{"tslib":"node_modules/tslib/tslib.es6.js","search-params":"node_modules/search-params/dist/search-params.esm.js"}],"node_modules/route-node/dist/route-node.esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteNode = void 0;

var _tslib = require("tslib");

var _pathParser = require("path-parser");

var _searchParams = require("search-params");

var getMetaFromSegments = function getMetaFromSegments(segments) {
  var accName = '';
  return segments.reduce(function (meta, segment) {
    var _a, _b, _c, _d;

    var urlParams = (_b = (_a = segment.parser) === null || _a === void 0 ? void 0 : _a.urlParams.reduce(function (params, p) {
      params[p] = 'url';
      return params;
    }, {}), _b !== null && _b !== void 0 ? _b : {});
    var allParams = (_d = (_c = segment.parser) === null || _c === void 0 ? void 0 : _c.queryParams.reduce(function (params, p) {
      params[p] = 'query';
      return params;
    }, urlParams), _d !== null && _d !== void 0 ? _d : {});

    if (segment.name !== undefined) {
      accName = accName ? accName + '.' + segment.name : segment.name;
      meta[accName] = allParams;
    }

    return meta;
  }, {});
};

var buildStateFromMatch = function buildStateFromMatch(match) {
  if (!match || !match.segments || !match.segments.length) {
    return null;
  }

  var name = match.segments.map(function (segment) {
    return segment.name;
  }).filter(function (name) {
    return name;
  }).join('.');
  var params = match.params;
  return {
    name: name,
    params: params,
    meta: getMetaFromSegments(match.segments)
  };
};

var buildPathFromSegments = function buildPathFromSegments(segments, params, options) {
  if (params === void 0) {
    params = {};
  }

  if (options === void 0) {
    options = {};
  }

  var _a = options.queryParamsMode,
      queryParamsMode = _a === void 0 ? 'default' : _a,
      _b = options.trailingSlashMode,
      trailingSlashMode = _b === void 0 ? 'default' : _b;
  var searchParams = [];
  var nonSearchParams = [];

  for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
    var segment = segments_1[_i];
    var parser = segment.parser;

    if (parser) {
      searchParams.push.apply(searchParams, parser.queryParams);
      nonSearchParams.push.apply(nonSearchParams, parser.urlParams);
      nonSearchParams.push.apply(nonSearchParams, parser.spatParams);
    }
  }

  if (queryParamsMode === 'loose') {
    var extraParams = Object.keys(params).reduce(function (acc, p) {
      return searchParams.indexOf(p) === -1 && nonSearchParams.indexOf(p) === -1 ? acc.concat(p) : acc;
    }, []);
    searchParams.push.apply(searchParams, extraParams);
  }

  var searchParamsObject = searchParams.reduce(function (acc, paramName) {
    if (Object.keys(params).indexOf(paramName) !== -1) {
      acc[paramName] = params[paramName];
    }

    return acc;
  }, {});
  var searchPart = (0, _searchParams.build)(searchParamsObject, options.queryParams);
  var path = segments.reduce(function (path, segment) {
    var _a, _b;

    var segmentPath = (_b = (_a = segment.parser) === null || _a === void 0 ? void 0 : _a.build(params, {
      ignoreSearch: true,
      queryParams: options.queryParams,
      urlParamsEncoding: options.urlParamsEncoding
    }), _b !== null && _b !== void 0 ? _b : '');
    return segment.absolute ? segmentPath : path + segmentPath;
  }, '') // remove repeated slashes
  .replace(/\/\/{1,}/g, '/');
  var finalPath = path;

  if (trailingSlashMode === 'always') {
    finalPath = /\/$/.test(path) ? path : path + "/";
  } else if (trailingSlashMode === 'never' && path !== '/') {
    finalPath = /\/$/.test(path) ? path.slice(0, -1) : path;
  }

  return finalPath + (searchPart ? '?' + searchPart : '');
};

var getPathFromSegments = function getPathFromSegments(segments) {
  return segments ? segments.map(function (segment) {
    return segment.path;
  }).join('') : null;
};

var getPath = function getPath(path) {
  return path.split('?')[0];
};

var getSearch = function getSearch(path) {
  return path.split('?')[1] || '';
};

var matchChildren = function matchChildren(nodes, pathSegment, currentMatch, options, consumedBefore) {
  if (options === void 0) {
    options = {};
  }

  var _a = options.queryParamsMode,
      queryParamsMode = _a === void 0 ? 'default' : _a,
      _b = options.strictTrailingSlash,
      strictTrailingSlash = _b === void 0 ? false : _b,
      _c = options.strongMatching,
      strongMatching = _c === void 0 ? true : _c,
      _d = options.caseSensitive,
      caseSensitive = _d === void 0 ? false : _d;
  var isRoot = nodes.length === 1 && nodes[0].name === '';

  var _loop_1 = function _loop_1(child) {
    // Partially match path
    var match = null;
    var remainingPath = void 0;
    var segment = pathSegment;

    if (consumedBefore === '/' && child.path === '/') {
      // when we encounter repeating slashes we add the slash
      // back to the URL to make it de facto pathless
      segment = '/' + pathSegment;
    }

    if (!child.children.length) {
      match = child.parser.test(segment, {
        caseSensitive: caseSensitive,
        strictTrailingSlash: strictTrailingSlash,
        queryParams: options.queryParams,
        urlParamsEncoding: options.urlParamsEncoding
      });
    }

    if (!match) {
      match = child.parser.partialTest(segment, {
        delimited: strongMatching,
        caseSensitive: caseSensitive,
        queryParams: options.queryParams,
        urlParamsEncoding: options.urlParamsEncoding
      });
    }

    if (match) {
      // Remove consumed segment from path
      var consumedPath = child.parser.build(match, {
        ignoreSearch: true,
        urlParamsEncoding: options.urlParamsEncoding
      });

      if (!strictTrailingSlash && !child.children.length) {
        consumedPath = consumedPath.replace(/\/$/, '');
      } // Can't create a regexp from the path because it might contain a
      // regexp character.


      if (segment.toLowerCase().indexOf(consumedPath.toLowerCase()) === 0) {
        remainingPath = segment.slice(consumedPath.length);
      } else {
        remainingPath = segment;
      }

      if (!strictTrailingSlash && !child.children.length) {
        remainingPath = remainingPath.replace(/^\/\?/, '?');
      }

      var querystring = (0, _searchParams.omit)(getSearch(segment.replace(consumedPath, '')), child.parser.queryParams, options.queryParams).querystring;
      remainingPath = getPath(remainingPath) + (querystring ? "?" + querystring : '');

      if (!strictTrailingSlash && !isRoot && remainingPath === '/' && !/\/$/.test(consumedPath)) {
        remainingPath = '';
      }

      currentMatch.segments.push(child);
      Object.keys(match).forEach(function (param) {
        return currentMatch.params[param] = match[param];
      });

      if (!isRoot && !remainingPath.length) {
        return {
          value: currentMatch
        };
      }

      if (!isRoot && queryParamsMode !== 'strict' && remainingPath.indexOf('?') === 0) {
        // unmatched queryParams in non strict mode
        var remainingQueryParams_1 = (0, _searchParams.parse)(remainingPath.slice(1), options.queryParams);
        Object.keys(remainingQueryParams_1).forEach(function (name) {
          return currentMatch.params[name] = remainingQueryParams_1[name];
        });
        return {
          value: currentMatch
        };
      } // Continue matching on non absolute children


      var children = child.getNonAbsoluteChildren(); // If no children to match against but unmatched path left

      if (!children.length) {
        return {
          value: null
        };
      }

      return {
        value: matchChildren(children, remainingPath, currentMatch, options, consumedPath)
      };
    }
  }; // for (child of node.children) {


  for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
    var child = nodes_1[_i];

    var state_1 = _loop_1(child);

    if (typeof state_1 === "object") return state_1.value;
  }

  return null;
};

function sortChildren(children) {
  var originalChildren = children.slice(0);
  return children.sort(sortPredicate(originalChildren));
}

var sortPredicate = function sortPredicate(originalChildren) {
  return function (left, right) {
    var _a, _b, _c, _d, _e, _f;

    var leftPath = left.path.replace(/<.*?>/g, '').split('?')[0].replace(/(.+)\/$/, '$1');
    var rightPath = right.path.replace(/<.*?>/g, '').split('?')[0].replace(/(.+)\/$/, '$1'); // '/' last

    if (leftPath === '/') {
      return 1;
    }

    if (rightPath === '/') {
      return -1;
    } // Spat params last


    if ((_a = left.parser) === null || _a === void 0 ? void 0 : _a.hasSpatParam) {
      return 1;
    }

    if ((_b = right.parser) === null || _b === void 0 ? void 0 : _b.hasSpatParam) {
      return -1;
    } // No spat, number of segments (less segments last)


    var leftSegments = (leftPath.match(/\//g) || []).length;
    var rightSegments = (rightPath.match(/\//g) || []).length;

    if (leftSegments < rightSegments) {
      return 1;
    }

    if (leftSegments > rightSegments) {
      return -1;
    } // Same number of segments, number of URL params ascending


    var leftParamsCount = (_d = (_c = left.parser) === null || _c === void 0 ? void 0 : _c.urlParams.length, _d !== null && _d !== void 0 ? _d : 0);
    var rightParamsCount = (_f = (_e = right.parser) === null || _e === void 0 ? void 0 : _e.urlParams.length, _f !== null && _f !== void 0 ? _f : 0);

    if (leftParamsCount < rightParamsCount) {
      return -1;
    }

    if (leftParamsCount > rightParamsCount) {
      return 1;
    } // Same number of segments and params, last segment length descending


    var leftParamLength = (leftPath.split('/').slice(-1)[0] || '').length;
    var rightParamLength = (rightPath.split('/').slice(-1)[0] || '').length;

    if (leftParamLength < rightParamLength) {
      return 1;
    }

    if (leftParamLength > rightParamLength) {
      return -1;
    } // Same last segment length, preserve definition order. Note that we
    // cannot just return 0, as sort is not guaranteed to be a stable sort.


    return originalChildren.indexOf(left) - originalChildren.indexOf(right);
  };
};

var RouteNode =
/*#__PURE__*/

/** @class */
function () {
  function RouteNode(name, path, childRoutes, options) {
    if (name === void 0) {
      name = '';
    }

    if (path === void 0) {
      path = '';
    }

    if (childRoutes === void 0) {
      childRoutes = [];
    }

    if (options === void 0) {
      options = {};
    }

    this.name = name;
    this.absolute = /^~/.test(path);
    this.path = this.absolute ? path.slice(1) : path;
    this.parser = this.path ? new _pathParser.Path(this.path) : null;
    this.children = [];
    this.parent = options.parent;
    this.checkParents();
    this.add(childRoutes, options.onAdd, options.finalSort ? false : options.sort !== false);

    if (options.finalSort) {
      this.sortDescendants();
    }

    return this;
  }

  RouteNode.prototype.getParentSegments = function (segments) {
    if (segments === void 0) {
      segments = [];
    }

    return this.parent && this.parent.parser ? this.parent.getParentSegments(segments.concat(this.parent)) : segments.reverse();
  };

  RouteNode.prototype.setParent = function (parent) {
    this.parent = parent;
    this.checkParents();
  };

  RouteNode.prototype.setPath = function (path) {
    if (path === void 0) {
      path = '';
    }

    this.path = path;
    this.parser = path ? new _pathParser.Path(path) : null;
  };

  RouteNode.prototype.add = function (route, cb, sort) {
    var _this = this;

    if (sort === void 0) {
      sort = true;
    }

    if (route === undefined || route === null) {
      return this;
    }

    if (route instanceof Array) {
      route.forEach(function (r) {
        return _this.add(r, cb, sort);
      });
      return this;
    }

    if (!(route instanceof RouteNode) && !(route instanceof Object)) {
      throw new Error('RouteNode.add() expects routes to be an Object or an instance of RouteNode.');
    } else if (route instanceof RouteNode) {
      route.setParent(this);
      this.addRouteNode(route, sort);
    } else {
      if (!route.name || !route.path) {
        throw new Error('RouteNode.add() expects routes to have a name and a path defined.');
      }

      var routeNode = new RouteNode(route.name, route.path, route.children, {
        finalSort: false,
        onAdd: cb,
        parent: this,
        sort: sort
      });
      var fullName = routeNode.getParentSegments([routeNode]).map(function (_) {
        return _.name;
      }).join('.');

      if (cb) {
        cb((0, _tslib.__assign)((0, _tslib.__assign)({}, route), {
          name: fullName
        }));
      }

      this.addRouteNode(routeNode, sort);
    }

    return this;
  };

  RouteNode.prototype.addNode = function (name, path) {
    this.add(new RouteNode(name, path));
    return this;
  };

  RouteNode.prototype.getPath = function (routeName) {
    var segmentsByName = this.getSegmentsByName(routeName);
    return segmentsByName ? getPathFromSegments(segmentsByName) : null;
  };

  RouteNode.prototype.getNonAbsoluteChildren = function () {
    return this.children.filter(function (child) {
      return !child.absolute;
    });
  };

  RouteNode.prototype.sortChildren = function () {
    if (this.children.length) {
      sortChildren(this.children);
    }
  };

  RouteNode.prototype.sortDescendants = function () {
    this.sortChildren();
    this.children.forEach(function (child) {
      return child.sortDescendants();
    });
  };

  RouteNode.prototype.buildPath = function (routeName, params, options) {
    if (params === void 0) {
      params = {};
    }

    if (options === void 0) {
      options = {};
    }

    var segments = this.getSegmentsByName(routeName);

    if (!segments) {
      throw new Error("[route-node][buildPath] '{routeName}' is not defined");
    }

    return buildPathFromSegments(segments, params, options);
  };

  RouteNode.prototype.buildState = function (name, params) {
    if (params === void 0) {
      params = {};
    }

    var segments = this.getSegmentsByName(name);

    if (!segments || !segments.length) {
      return null;
    }

    return {
      name: name,
      params: params,
      meta: getMetaFromSegments(segments)
    };
  };

  RouteNode.prototype.matchPath = function (path, options) {
    if (options === void 0) {
      options = {};
    }

    if (path === '' && !options.strictTrailingSlash) {
      path = '/';
    }

    var match = this.getSegmentsMatchingPath(path, options);

    if (!match) {
      return null;
    }

    var matchedSegments = match.segments;

    if (matchedSegments[0].absolute) {
      var firstSegmentParams = matchedSegments[0].getParentSegments();
      matchedSegments.reverse();
      matchedSegments.push.apply(matchedSegments, firstSegmentParams);
      matchedSegments.reverse();
    }

    var lastSegment = matchedSegments[matchedSegments.length - 1];
    var lastSegmentSlashChild = lastSegment.findSlashChild();

    if (lastSegmentSlashChild) {
      matchedSegments.push(lastSegmentSlashChild);
    }

    return buildStateFromMatch(match);
  };

  RouteNode.prototype.addRouteNode = function (route, sort) {
    if (sort === void 0) {
      sort = true;
    }

    var names = route.name.split('.');

    if (names.length === 1) {
      // Check duplicated routes
      if (this.children.map(function (child) {
        return child.name;
      }).indexOf(route.name) !== -1) {
        throw new Error("Alias \"" + route.name + "\" is already defined in route node");
      } // Check duplicated paths


      if (this.children.map(function (child) {
        return child.path;
      }).indexOf(route.path) !== -1) {
        throw new Error("Path \"" + route.path + "\" is already defined in route node");
      }

      this.children.push(route);

      if (sort) {
        this.sortChildren();
      }
    } else {
      // Locate parent node
      var segments = this.getSegmentsByName(names.slice(0, -1).join('.'));

      if (segments) {
        route.name = names[names.length - 1];
        segments[segments.length - 1].add(route);
      } else {
        throw new Error("Could not add route named '" + route.name + "', parent is missing.");
      }
    }

    return this;
  };

  RouteNode.prototype.checkParents = function () {
    if (this.absolute && this.hasParentsParams()) {
      throw new Error('[RouteNode] A RouteNode with an abolute path cannot have parents with route parameters');
    }
  };

  RouteNode.prototype.hasParentsParams = function () {
    if (this.parent && this.parent.parser) {
      var parser = this.parent.parser;
      var hasParams = parser.hasUrlParams || parser.hasSpatParam || parser.hasMatrixParams || parser.hasQueryParams;
      return hasParams || this.parent.hasParentsParams();
    }

    return false;
  };

  RouteNode.prototype.findAbsoluteChildren = function () {
    return this.children.reduce(function (absoluteChildren, child) {
      return absoluteChildren.concat(child.absolute ? child : []).concat(child.findAbsoluteChildren());
    }, []);
  };

  RouteNode.prototype.findSlashChild = function () {
    var slashChildren = this.getNonAbsoluteChildren().filter(function (child) {
      return child.parser && /^\/(\?|$)/.test(child.parser.path);
    });
    return slashChildren[0];
  };

  RouteNode.prototype.getSegmentsByName = function (routeName) {
    var findSegmentByName = function findSegmentByName(name, routes) {
      var filteredRoutes = routes.filter(function (r) {
        return r.name === name;
      });
      return filteredRoutes.length ? filteredRoutes[0] : undefined;
    };

    var segments = [];
    var routes = this.parser ? [this] : this.children;
    var names = (this.parser ? [''] : []).concat(routeName.split('.'));
    var matched = names.every(function (name) {
      var segment = findSegmentByName(name, routes);

      if (segment) {
        routes = segment.children;
        segments.push(segment);
        return true;
      }

      return false;
    });
    return matched ? segments : null;
  };

  RouteNode.prototype.getSegmentsMatchingPath = function (path, options) {
    var topLevelNodes = this.parser ? [this] : this.children;
    var startingNodes = topLevelNodes.reduce(function (nodes, node) {
      return nodes.concat(node, node.findAbsoluteChildren());
    }, []);
    var currentMatch = {
      segments: [],
      params: {}
    };
    var finalMatch = matchChildren(startingNodes, path, currentMatch, options);

    if (finalMatch && finalMatch.segments.length === 1 && finalMatch.segments[0].name === '') {
      return null;
    }

    return finalMatch;
  };

  return RouteNode;
}();

exports.RouteNode = RouteNode;
},{"tslib":"node_modules/tslib/tslib.es6.js","path-parser":"node_modules/path-parser/dist/path-parser.esm.js","search-params":"node_modules/search-params/dist/search-params.esm.js"}],"node_modules/symbol-observable/es/ponyfill.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = symbolObservablePonyfill;

function symbolObservablePonyfill(root) {
  var result;
  var Symbol = root.Symbol;

  if (typeof Symbol === 'function') {
    if (Symbol.observable) {
      result = Symbol.observable;
    } else {
      result = Symbol('observable');
      Symbol.observable = result;
    }
  } else {
    result = '@@observable';
  }

  return result;
}

;
},{}],"node_modules/symbol-observable/es/index.js":[function(require,module,exports) {
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ponyfill = _interopRequireDefault(require("./ponyfill.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global window */
var root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill.default)(root);
var _default = result;
exports.default = _default;
},{"./ponyfill.js":"node_modules/symbol-observable/es/ponyfill.js"}],"node_modules/router5-transition-path/dist/index.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shouldUpdateNode = shouldUpdateNode;
exports.nameToIDs = exports.default = void 0;

var nameToIDs = function (name) {
  return name.split('.').reduce(function (ids, name) {
    return ids.concat(ids.length ? ids[ids.length - 1] + '.' + name : name);
  }, []);
};

exports.nameToIDs = nameToIDs;

var exists = function (val) {
  return val !== undefined && val !== null;
};

var hasMetaParams = function (state) {
  return state && state.meta && state.meta.params;
};

var extractSegmentParams = function (name, state) {
  if (!hasMetaParams(state) || !exists(state.meta.params[name])) return {};
  return Object.keys(state.meta.params[name]).reduce(function (params, p) {
    params[p] = state.params[p];
    return params;
  }, {});
};

function transitionPath(toState, fromState) {
  var toStateOptions = toState.meta && toState.meta && toState.meta.options || {};
  var fromStateIds = fromState ? nameToIDs(fromState.name) : [];
  var toStateIds = nameToIDs(toState.name);
  var maxI = Math.min(fromStateIds.length, toStateIds.length);

  function pointOfDifference() {
    var i;

    var _loop_1 = function () {
      var left = fromStateIds[i];
      var right = toStateIds[i];
      if (left !== right) return {
        value: i
      };
      var leftParams = extractSegmentParams(left, toState);
      var rightParams = extractSegmentParams(right, fromState);
      if (Object.keys(leftParams).length !== Object.keys(rightParams).length) return {
        value: i
      };
      if (Object.keys(leftParams).length === 0) return "continue";
      var different = Object.keys(leftParams).some(function (p) {
        return rightParams[p] !== leftParams[p];
      });

      if (different) {
        return {
          value: i
        };
      }
    };

    for (i = 0; i < maxI; i += 1) {
      var state_1 = _loop_1();

      if (typeof state_1 === "object") return state_1.value;
    }

    return i;
  }

  var i;

  if (!fromState || toStateOptions.reload) {
    i = 0;
  } else if (!hasMetaParams(fromState) && !hasMetaParams(toState)) {
    i = 0;
  } else {
    i = pointOfDifference();
  }

  var toDeactivate = fromStateIds.slice(i).reverse();
  var toActivate = toStateIds.slice(i);
  var intersection = fromState && i > 0 ? fromStateIds[i - 1] : '';
  return {
    intersection: intersection,
    toDeactivate: toDeactivate,
    toActivate: toActivate
  };
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */


function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
}

function shouldUpdateNode(nodeName) {
  return function (toState, fromSate) {
    var _a = transitionPath(toState, fromSate),
        intersection = _a.intersection,
        toActivate = _a.toActivate,
        toDeactivateReversed = _a.toDeactivate;

    var toDeactivate = __spreadArrays(toDeactivateReversed).reverse();

    if (toState.meta.options && toState.meta.options.reload) {
      return true;
    }

    if (nodeName === intersection) {
      return true;
    }

    if (toActivate.indexOf(nodeName) === -1) {
      return false;
    }

    var matching = true;

    for (var i = 0; i < toActivate.length; i += 1) {
      var activatedSegment = toActivate[i];
      var sameLevelDeactivatedSegment = toDeactivate[i];
      matching = activatedSegment === sameLevelDeactivatedSegment;

      if (matching && activatedSegment === nodeName) {
        return true;
      }

      if (!matching) {
        return false;
      }
    }

    return false;
  };
}

var _default = transitionPath;
exports.default = _default;
},{}],"node_modules/router5/dist/index.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cloneRouter = cloneRouter;
Object.defineProperty(exports, "RouteNode", {
  enumerable: true,
  get: function () {
    return _routeNode.RouteNode;
  }
});
Object.defineProperty(exports, "transitionPath", {
  enumerable: true,
  get: function () {
    return _router5TransitionPath.default;
  }
});
exports.errorCodes = exports.createRouter = exports.constants = exports.default = void 0;

var _routeNode = require("route-node");

var _symbolObservable = _interopRequireDefault(require("symbol-observable"));

var _router5TransitionPath = _interopRequireWildcard(require("router5-transition-path"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var defaultOptions = {
  trailingSlashMode: 'default',
  queryParamsMode: 'default',
  strictTrailingSlash: false,
  autoCleanUp: true,
  allowNotFound: false,
  strongMatching: true,
  rewritePathOnMatch: true,
  caseSensitive: false,
  urlParamsEncoding: 'default'
};

function withOptions(options) {
  return function (router) {
    var routerOptions = __assign(__assign({}, defaultOptions), options);

    router.getOptions = function () {
      return routerOptions;
    };

    router.setOption = function (option, value) {
      routerOptions[option] = value;
      return router;
    };

    return router;
  };
}

var errorCodes = {
  ROUTER_NOT_STARTED: 'NOT_STARTED',
  NO_START_PATH_OR_STATE: 'NO_START_PATH_OR_STATE',
  ROUTER_ALREADY_STARTED: 'ALREADY_STARTED',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  SAME_STATES: 'SAME_STATES',
  CANNOT_DEACTIVATE: 'CANNOT_DEACTIVATE',
  CANNOT_ACTIVATE: 'CANNOT_ACTIVATE',
  TRANSITION_ERR: 'TRANSITION_ERR',
  TRANSITION_CANCELLED: 'CANCELLED'
};
exports.errorCodes = errorCodes;
var constants = {
  UNKNOWN_ROUTE: '@@router5/UNKNOWN_ROUTE',
  ROUTER_START: '$start',
  ROUTER_STOP: '$stop',
  TRANSITION_START: '$$start',
  TRANSITION_CANCEL: '$$cancel',
  TRANSITION_SUCCESS: '$$success',
  TRANSITION_ERROR: '$$error'
};
exports.constants = constants;

function withRoutes(routes) {
  return function (router) {
    router.forward = function (fromRoute, toRoute) {
      router.config.forwardMap[fromRoute] = toRoute;
      return router;
    };

    var rootNode = routes instanceof _routeNode.RouteNode ? routes : new _routeNode.RouteNode('', '', routes, {
      onAdd: onRouteAdded
    });

    function onRouteAdded(route) {
      if (route.canActivate) router.canActivate(route.name, route.canActivate);
      if (route.forwardTo) router.forward(route.name, route.forwardTo);
      if (route.decodeParams) router.config.decoders[route.name] = route.decodeParams;
      if (route.encodeParams) router.config.encoders[route.name] = route.encodeParams;
      if (route.defaultParams) router.config.defaultParams[route.name] = route.defaultParams;
    }

    router.rootNode = rootNode;

    router.add = function (routes, finalSort) {
      rootNode.add(routes, onRouteAdded, !finalSort);

      if (finalSort) {
        rootNode.sortDescendants();
      }

      return router;
    };

    router.addNode = function (name, path, canActivateHandler) {
      rootNode.addNode(name, path);
      if (canActivateHandler) router.canActivate(name, canActivateHandler);
      return router;
    };

    router.isActive = function (name, params, strictEquality, ignoreQueryParams) {
      if (params === void 0) {
        params = {};
      }

      if (strictEquality === void 0) {
        strictEquality = false;
      }

      if (ignoreQueryParams === void 0) {
        ignoreQueryParams = true;
      }

      var activeState = router.getState();
      if (!activeState) return false;

      if (strictEquality || activeState.name === name) {
        return router.areStatesEqual(router.makeState(name, params), activeState, ignoreQueryParams);
      }

      return router.areStatesDescendants(router.makeState(name, params), activeState);
    };

    router.buildPath = function (route, params) {
      if (route === constants.UNKNOWN_ROUTE) {
        return params.path;
      }

      var paramsWithDefault = __assign(__assign({}, router.config.defaultParams[route]), params);

      var _a = router.getOptions(),
          trailingSlashMode = _a.trailingSlashMode,
          queryParamsMode = _a.queryParamsMode,
          queryParams = _a.queryParams;

      var encodedParams = router.config.encoders[route] ? router.config.encoders[route](paramsWithDefault) : paramsWithDefault;
      return router.rootNode.buildPath(route, encodedParams, {
        trailingSlashMode: trailingSlashMode,
        queryParamsMode: queryParamsMode,
        queryParams: queryParams,
        urlParamsEncoding: router.getOptions().urlParamsEncoding
      });
    };

    router.matchPath = function (path, source) {
      var options = router.getOptions();
      var match = router.rootNode.matchPath(path, options);

      if (match) {
        var name_1 = match.name,
            params = match.params,
            meta = match.meta;
        var decodedParams = router.config.decoders[name_1] ? router.config.decoders[name_1](params) : params;

        var _a = router.forwardState(name_1, decodedParams),
            routeName = _a.name,
            routeParams = _a.params;

        var builtPath = options.rewritePathOnMatch === false ? path : router.buildPath(routeName, routeParams);
        return router.makeState(routeName, routeParams, builtPath, {
          params: meta,
          source: source
        });
      }

      return null;
    };

    router.setRootPath = function (rootPath) {
      router.rootNode.setPath(rootPath);
    };

    return router;
  };
}

function withDependencies(dependencies) {
  return function (router) {
    var routerDependencies = dependencies;

    router.setDependency = function (dependencyName, dependency) {
      routerDependencies[dependencyName] = dependency;
      return router;
    };

    router.setDependencies = function (deps) {
      Object.keys(deps).forEach(function (name) {
        return router.setDependency(name, deps[name]);
      });
      return router;
    };

    router.getDependencies = function () {
      return routerDependencies;
    };

    router.getInjectables = function () {
      return [router, router.getDependencies()];
    };

    router.executeFactory = function (factoryFunction) {
      return factoryFunction.apply(void 0, router.getInjectables());
    };

    return router;
  };
}

function withState(router) {
  var stateId = 0;
  var routerState = null;

  router.getState = function () {
    return routerState;
  };

  router.setState = function (state) {
    routerState = state;
  };

  router.makeState = function (name, params, path, meta, forceId) {
    return {
      name: name,
      params: __assign(__assign({}, router.config.defaultParams[name]), params),
      path: path,
      meta: meta ? __assign(__assign({}, meta), {
        id: forceId === undefined ? ++stateId : forceId
      }) : undefined
    };
  };

  router.makeNotFoundState = function (path, options) {
    return router.makeState(constants.UNKNOWN_ROUTE, {
      path: path
    }, path, {
      options: options
    });
  };

  router.areStatesEqual = function (state1, state2, ignoreQueryParams) {
    if (ignoreQueryParams === void 0) {
      ignoreQueryParams = true;
    }

    if (state1.name !== state2.name) return false;

    var getUrlParams = function (name) {
      return router.rootNode //@ts-ignore
      .getSegmentsByName(name).map(function (segment) {
        return segment.parser['urlParams'];
      }).reduce(function (params, p) {
        return params.concat(p);
      }, []);
    };

    var state1Params = ignoreQueryParams ? getUrlParams(state1.name) : Object.keys(state1.params);
    var state2Params = ignoreQueryParams ? getUrlParams(state2.name) : Object.keys(state2.params);
    return state1Params.length === state2Params.length && state1Params.every(function (p) {
      return state1.params[p] === state2.params[p];
    });
  };

  router.areStatesDescendants = function (parentState, childState) {
    var regex = new RegExp('^' + parentState.name + '\\.(.*)$');
    if (!regex.test(childState.name)) return false; // If child state name extends parent state name, and all parent state params
    // are in child state params.

    return Object.keys(parentState.params).every(function (p) {
      return parentState.params[p] === childState.params[p];
    });
  };

  router.forwardState = function (routeName, routeParams) {
    var name = router.config.forwardMap[routeName] || routeName;

    var params = __assign(__assign(__assign({}, router.config.defaultParams[routeName]), router.config.defaultParams[name]), routeParams);

    return {
      name: name,
      params: params
    };
  };

  router.buildState = function (routeName, routeParams) {
    var _a = router.forwardState(routeName, routeParams),
        name = _a.name,
        params = _a.params;

    return router.rootNode.buildState(name, params);
  };

  return router;
}

var eventsMap = {
  onStart: constants.ROUTER_START,
  onStop: constants.ROUTER_STOP,
  onTransitionSuccess: constants.TRANSITION_SUCCESS,
  onTransitionStart: constants.TRANSITION_START,
  onTransitionError: constants.TRANSITION_ERROR,
  onTransitionCancel: constants.TRANSITION_CANCEL
};

function withPlugins(router) {
  var routerPlugins = [];

  router.getPlugins = function () {
    return routerPlugins;
  };

  router.usePlugin = function () {
    var plugins = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      plugins[_i] = arguments[_i];
    }

    var removePluginFns = plugins.map(function (plugin) {
      routerPlugins.push(plugin);
      return startPlugin(plugin);
    });
    return function () {
      routerPlugins = routerPlugins.filter(function (plugin) {
        return plugins.indexOf(plugin) === -1;
      });
      removePluginFns.forEach(function (removePlugin) {
        return removePlugin();
      });
    };
  };

  function startPlugin(plugin) {
    var appliedPlugin = router.executeFactory(plugin);
    var removeEventListeners = Object.keys(eventsMap).map(function (methodName) {
      if (appliedPlugin[methodName]) {
        return router.addEventListener(eventsMap[methodName], appliedPlugin[methodName]);
      }
    }).filter(Boolean);
    return function () {
      removeEventListeners.forEach(function (removeListener) {
        return removeListener();
      });

      if (appliedPlugin.teardown) {
        appliedPlugin.teardown();
      }
    };
  }

  return router;
}

function withMiddleware(router) {
  var middlewareFactories = [];
  var middlewareFunctions = [];

  router.useMiddleware = function () {
    var middlewares = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      middlewares[_i] = arguments[_i];
    }

    var removePluginFns = middlewares.map(function (middleware) {
      var middlewareFunction = router.executeFactory(middleware);
      middlewareFactories.push(middleware);
      middlewareFunctions.push(middlewareFunction);
      return function () {
        middlewareFactories = middlewareFactories.filter(function (m) {
          return m !== middleware;
        });
        middlewareFunctions = middlewareFunctions.filter(function (m) {
          return m !== middlewareFunction;
        });
      };
    });
    return function () {
      return removePluginFns.forEach(function (fn) {
        return fn();
      });
    };
  };

  router.clearMiddleware = function () {
    middlewareFactories = [];
    middlewareFunctions = [];
    return router;
  };

  router.getMiddlewareFactories = function () {
    return middlewareFactories;
  };

  router.getMiddlewareFunctions = function () {
    return middlewareFunctions;
  };

  return router;
}

function withObservability(router) {
  var callbacks = {};

  router.invokeEventListeners = function (eventName) {
    var args = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }

    (callbacks[eventName] || []).forEach(function (cb) {
      return cb.apply(void 0, args);
    });
  };

  router.removeEventListener = function (eventName, cb) {
    callbacks[eventName] = callbacks[eventName].filter(function (_cb) {
      return _cb !== cb;
    });
  };

  router.addEventListener = function (eventName, cb) {
    callbacks[eventName] = (callbacks[eventName] || []).concat(cb);
    return function () {
      return router.removeEventListener(eventName, cb);
    };
  };

  function subscribe(listener) {
    var isObject = typeof listener === 'object';
    var finalListener = isObject ? listener.next.bind(listener) : listener;
    var unsubscribeHandler = router.addEventListener(constants.TRANSITION_SUCCESS, function (toState, fromState) {
      finalListener({
        route: toState,
        previousRoute: fromState
      });
    });
    return isObject ? {
      unsubscribe: unsubscribeHandler
    } : unsubscribeHandler;
  }

  function observable() {
    var _a;

    return _a = {
      subscribe: function (observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.');
        }

        return subscribe(observer);
      }
    }, _a[_symbolObservable.default] = function () {
      return this;
    }, _a;
  }

  router.subscribe = subscribe; //@ts-ignore

  router[_symbolObservable.default] = observable; //@ts-ignore

  router['@@observable'] = observable;
  return router;
}

function resolve(functions, _a, callback) {
  var isCancelled = _a.isCancelled,
      toState = _a.toState,
      fromState = _a.fromState,
      _b = _a.errorKey,
      errorKey = _b === void 0 ? undefined : _b;
  var remainingFunctions = Array.isArray(functions) ? functions : Object.keys(functions);

  var isState = function (obj) {
    return typeof obj === 'object' && obj.name !== undefined && obj.params !== undefined && obj.path !== undefined;
  };

  var hasStateChanged = function (toState, fromState) {
    return fromState.name !== toState.name || fromState.params !== toState.params || fromState.path !== toState.path;
  };

  var mergeStates = function (toState, fromState) {
    return __assign(__assign(__assign({}, fromState), toState), {
      meta: __assign(__assign({}, fromState.meta), toState.meta)
    });
  };

  var processFn = function (stepFn, errBase, state, _done) {
    var done = function (err, newState) {
      if (err) {
        _done(err);
      } else if (newState && newState !== state && isState(newState)) {
        if (hasStateChanged(newState, state)) {
          console.error('[router5][transition] Warning: state values (name, params, path) were changed during transition process.');
        }

        _done(null, mergeStates(newState, state));
      } else {
        _done(null, state);
      }
    };

    var res = stepFn.call(null, state, fromState, done);

    if (isCancelled()) {
      done(null);
    } else if (typeof res === 'boolean') {
      done(res ? null : errBase);
    } else if (isState(res)) {
      done(null, res);
    } else if (res && typeof res.then === 'function') {
      res.then(function (resVal) {
        if (resVal instanceof Error) done({
          error: resVal
        }, null);else done(null, resVal);
      }, function (err) {
        if (err instanceof Error) {
          console.error(err.stack || err);
          done(__assign(__assign({}, errBase), {
            promiseError: err
          }), null);
        } else {
          done(typeof err === 'object' ? __assign(__assign({}, errBase), err) : errBase, null);
        }
      });
    } // else: wait for done to be called

  };

  var next = function (err, state) {
    var _a;

    if (isCancelled()) {
      callback();
    } else if (err) {
      callback(err);
    } else {
      if (!remainingFunctions.length) {
        callback(null, state);
      } else {
        var isMapped = typeof remainingFunctions[0] === 'string';
        var errBase = errorKey && isMapped ? (_a = {}, _a[errorKey] = remainingFunctions[0], _a) : {};
        var stepFn = isMapped ? functions[remainingFunctions[0]] : remainingFunctions[0];
        remainingFunctions = remainingFunctions.slice(1);
        processFn(stepFn, errBase, state, next);
      }
    }
  };

  next(null, toState);
}

function transition(router, toState, fromState, opts, callback) {
  var cancelled = false;
  var completed = false;
  var options = router.getOptions();

  var _a = router.getLifecycleFunctions(),
      canDeactivateFunctions = _a[0],
      canActivateFunctions = _a[1];

  var middlewareFunctions = router.getMiddlewareFunctions();

  var isCancelled = function () {
    return cancelled;
  };

  var cancel = function () {
    if (!cancelled && !completed) {
      cancelled = true;
      callback({
        code: errorCodes.TRANSITION_CANCELLED
      }, null);
    }
  };

  var done = function (err, state) {
    completed = true;

    if (isCancelled()) {
      return;
    }

    if (!err && options.autoCleanUp) {
      var activeSegments_1 = (0, _router5TransitionPath.nameToIDs)(toState.name);
      Object.keys(canDeactivateFunctions).forEach(function (name) {
        if (activeSegments_1.indexOf(name) === -1) router.clearCanDeactivate(name);
      });
    }

    callback(err, state || toState);
  };

  var makeError = function (base, err) {
    return __assign(__assign({}, base), err instanceof Object ? err : {
      error: err
    });
  };

  var isUnknownRoute = toState.name === constants.UNKNOWN_ROUTE;
  var asyncBase = {
    isCancelled: isCancelled,
    toState: toState,
    fromState: fromState
  };

  var _b = (0, _router5TransitionPath.default)(toState, fromState),
      toDeactivate = _b.toDeactivate,
      toActivate = _b.toActivate;

  var canDeactivate = !fromState || opts.forceDeactivate ? [] : function (toState, fromState, cb) {
    var canDeactivateFunctionMap = toDeactivate.filter(function (name) {
      return canDeactivateFunctions[name];
    }).reduce(function (fnMap, name) {
      var _a;

      return __assign(__assign({}, fnMap), (_a = {}, _a[name] = canDeactivateFunctions[name], _a));
    }, {});
    resolve(canDeactivateFunctionMap, __assign(__assign({}, asyncBase), {
      errorKey: 'segment'
    }), function (err) {
      return cb(err ? makeError({
        code: errorCodes.CANNOT_DEACTIVATE
      }, err) : null);
    });
  };
  var canActivate = isUnknownRoute ? [] : function (toState, fromState, cb) {
    var canActivateFunctionMap = toActivate.filter(function (name) {
      return canActivateFunctions[name];
    }).reduce(function (fnMap, name) {
      var _a;

      return __assign(__assign({}, fnMap), (_a = {}, _a[name] = canActivateFunctions[name], _a));
    }, {});
    resolve(canActivateFunctionMap, __assign(__assign({}, asyncBase), {
      errorKey: 'segment'
    }), function (err) {
      return cb(err ? makeError({
        code: errorCodes.CANNOT_ACTIVATE
      }, err) : null);
    });
  };
  var middleware = !middlewareFunctions.length ? [] : function (toState, fromState, cb) {
    return resolve(middlewareFunctions, __assign({}, asyncBase), function (err, state) {
      return cb(err ? makeError({
        code: errorCodes.TRANSITION_ERR
      }, err) : null, state || toState);
    });
  };
  var pipeline = [].concat(canDeactivate).concat(canActivate).concat(middleware);
  resolve(pipeline, asyncBase, done);
  return cancel;
}

var noop = function () {};

function withNavigation(router) {
  var cancelCurrentTransition;
  router.navigate = navigate;
  router.navigate = navigate;

  router.navigateToDefault = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    var opts = typeof args[0] === 'object' ? args[0] : {};
    var done = args.length === 2 ? args[1] : typeof args[0] === 'function' ? args[0] : noop;
    var options = router.getOptions();

    if (options.defaultRoute) {
      return navigate(options.defaultRoute, options.defaultParams, opts, done);
    }

    return function () {};
  };

  router.cancel = function () {
    if (cancelCurrentTransition) {
      cancelCurrentTransition('navigate');
      cancelCurrentTransition = null;
    }

    return router;
  };

  function navigate() {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    var name = args[0];
    var lastArg = args[args.length - 1];
    var done = typeof lastArg === 'function' ? lastArg : noop;
    var params = typeof args[1] === 'object' ? args[1] : {};
    var opts = typeof args[2] === 'object' ? args[2] : {};

    if (!router.isStarted()) {
      done({
        code: errorCodes.ROUTER_NOT_STARTED
      });
      return;
    }

    var route = router.buildState(name, params);

    if (!route) {
      var err = {
        code: errorCodes.ROUTE_NOT_FOUND
      };
      done(err);
      router.invokeEventListeners(constants.TRANSITION_ERROR, null, router.getState(), err);
      return;
    }

    var toState = router.makeState(route.name, route.params, router.buildPath(route.name, route.params), {
      params: route.meta,
      options: opts
    });
    var sameStates = router.getState() ? router.areStatesEqual(router.getState(), toState, false) : false; // Do not proceed further if states are the same and no reload
    // (no deactivation and no callbacks)

    if (sameStates && !opts.reload && !opts.force) {
      var err = {
        code: errorCodes.SAME_STATES
      };
      done(err);
      router.invokeEventListeners(constants.TRANSITION_ERROR, toState, router.getState(), err);
      return;
    }

    var fromState = router.getState();

    if (opts.skipTransition) {
      done(null, toState);
      return noop;
    } // Transition


    return router.transitionToState(toState, fromState, opts, function (err, state) {
      if (err) {
        if (err.redirect) {
          var _a = err.redirect,
              name_1 = _a.name,
              params_1 = _a.params;
          navigate(name_1, params_1, __assign(__assign({}, opts), {
            force: true,
            redirected: true
          }), done);
        } else {
          done(err);
        }
      } else {
        router.invokeEventListeners(constants.TRANSITION_SUCCESS, state, fromState, opts);
        done(null, state);
      }
    });
  }

  router.transitionToState = function (toState, fromState, options, done) {
    if (options === void 0) {
      options = {};
    }

    if (done === void 0) {
      done = noop;
    }

    router.cancel();
    router.invokeEventListeners(constants.TRANSITION_START, toState, fromState);
    cancelCurrentTransition = transition(router, toState, fromState, options, function (err, state) {
      cancelCurrentTransition = null;
      state = state || toState;

      if (err) {
        if (err.code === errorCodes.TRANSITION_CANCELLED) {
          router.invokeEventListeners(constants.TRANSITION_CANCEL, toState, fromState);
        } else {
          router.invokeEventListeners(constants.TRANSITION_ERROR, toState, fromState, err);
        }

        done(err);
      } else {
        router.setState(state);
        done(null, state);
      }
    });
    return cancelCurrentTransition;
  };

  return router;
}

var noop$1 = function () {};

function withRouterLifecycle(router) {
  var started = false;

  router.isStarted = function () {
    return started;
  }; //@ts-ignore


  router.start = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    var options = router.getOptions();
    var lastArg = args[args.length - 1];
    var done = typeof lastArg === 'function' ? lastArg : noop$1;
    var startPathOrState = typeof args[0] !== 'function' ? args[0] : undefined;

    if (started) {
      done({
        code: errorCodes.ROUTER_ALREADY_STARTED
      });
      return router;
    }

    var startPath, startState;
    started = true;
    router.invokeEventListeners(constants.ROUTER_START); // callback

    var cb = function (err, state, invokeErrCb) {
      if (invokeErrCb === void 0) {
        invokeErrCb = true;
      }

      if (!err) router.invokeEventListeners(constants.TRANSITION_SUCCESS, state, null, {
        replace: true
      });
      if (err && invokeErrCb) router.invokeEventListeners(constants.TRANSITION_ERROR, state, null, err);
      done(err, state);
    };

    if (startPathOrState === undefined && !options.defaultRoute) {
      return cb({
        code: errorCodes.NO_START_PATH_OR_STATE
      });
    }

    if (typeof startPathOrState === 'string') {
      startPath = startPathOrState;
    } else if (typeof startPathOrState === 'object') {
      startState = startPathOrState;
    }

    if (!startState) {
      // If no supplied start state, get start state
      startState = startPath === undefined ? null : router.matchPath(startPath); // Navigate to default function

      var navigateToDefault_1 = function () {
        return router.navigateToDefault({
          replace: true
        }, done);
      };

      var redirect_1 = function (route) {
        return router.navigate(route.name, route.params, {
          replace: true,
          reload: true,
          redirected: true
        }, done);
      };

      var transitionToState = function (state) {
        router.transitionToState(state, router.getState(), {}, function (err, state) {
          if (!err) cb(null, state);else if (err.redirect) redirect_1(err.redirect);else if (options.defaultRoute) navigateToDefault_1();else cb(err, null, false);
        });
      }; // If matched start path


      if (startState) {
        transitionToState(startState);
      } else if (options.defaultRoute) {
        // If default, navigate to default
        navigateToDefault_1();
      } else if (options.allowNotFound) {
        transitionToState(router.makeNotFoundState(startPath, {
          replace: true
        }));
      } else {
        // No start match, no default => do nothing
        cb({
          code: errorCodes.ROUTE_NOT_FOUND,
          path: startPath
        }, null);
      }
    } else {
      // Initialise router with provided start state
      router.setState(startState);
      cb(null, startState);
    }

    return router;
  };

  router.stop = function () {
    if (started) {
      router.setState(null);
      started = false;
      router.invokeEventListeners(constants.ROUTER_STOP);
    }

    return router;
  };

  return router;
}

var toFunction = function (val) {
  return typeof val === 'function' ? val : function () {
    return function () {
      return val;
    };
  };
};

function withRouteLifecycle(router) {
  var canDeactivateFactories = {};
  var canActivateFactories = {};
  var canDeactivateFunctions = {};
  var canActivateFunctions = {};

  router.getLifecycleFactories = function () {
    return [canDeactivateFactories, canActivateFactories];
  };

  router.getLifecycleFunctions = function () {
    return [canDeactivateFunctions, canActivateFunctions];
  };

  router.canDeactivate = function (name, canDeactivateHandler) {
    var factory = toFunction(canDeactivateHandler);
    canDeactivateFactories[name] = factory;
    canDeactivateFunctions[name] = router.executeFactory(factory);
    return router;
  };

  router.clearCanDeactivate = function (name) {
    canDeactivateFactories[name] = undefined;
    canDeactivateFunctions[name] = undefined;
    return router;
  };

  router.canActivate = function (name, canActivateHandler) {
    var factory = toFunction(canActivateHandler);
    canActivateFactories[name] = factory;
    canActivateFunctions[name] = router.executeFactory(factory);
    return router;
  };

  return router;
}

var pipe = function () {
  var fns = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    fns[_i] = arguments[_i];
  }

  return function (arg) {
    return fns.reduce(function (prev, fn) {
      return fn(prev);
    }, arg);
  };
};

var createRouter = function (routes, options, dependencies) {
  if (routes === void 0) {
    routes = [];
  }

  if (options === void 0) {
    options = {};
  }

  if (dependencies === void 0) {
    dependencies = {};
  }

  var config = {
    decoders: {},
    encoders: {},
    defaultParams: {},
    forwardMap: {}
  };
  return pipe(withOptions(options), withDependencies(dependencies), withObservability, withState, withRouterLifecycle, withRouteLifecycle, withNavigation, withPlugins, withMiddleware, withRoutes(routes))({
    config: config
  });
};

exports.createRouter = createRouter;

function cloneRouter(router, dependencies) {
  var clonedRouter = createRouter(router.rootNode, router.getOptions(), dependencies);
  clonedRouter.useMiddleware.apply(clonedRouter, router.getMiddlewareFactories());
  clonedRouter.usePlugin.apply(clonedRouter, router.getPlugins());
  clonedRouter.config = router.config;

  var _a = router.getLifecycleFactories(),
      canDeactivateFactories = _a[0],
      canActivateFactories = _a[1];

  Object.keys(canDeactivateFactories).forEach(function (name) {
    return clonedRouter.canDeactivate(name, canDeactivateFactories[name]);
  });
  Object.keys(canActivateFactories).forEach(function (name) {
    return clonedRouter.canActivate(name, canActivateFactories[name]);
  });
  return clonedRouter;
}

var _default = createRouter;
exports.default = _default;
},{"route-node":"node_modules/route-node/dist/route-node.esm.js","symbol-observable":"node_modules/symbol-observable/es/index.js","router5-transition-path":"node_modules/router5-transition-path/dist/index.es.js"}],"node_modules/router5-plugin-browser/dist/index.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _router = require("router5");

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
}

var value = function (arg) {
  return function () {
    return arg;
  };
};

var noop = function () {};

var isBrowser = typeof window !== 'undefined' && window.history;

var getBase = function () {
  return window.location.pathname;
};

var supportsPopStateOnHashChange = function () {
  return window.navigator.userAgent.indexOf('Trident') === -1;
};

var pushState = function (state, title, path) {
  return window.history.pushState(state, title, path);
};

var replaceState = function (state, title, path) {
  return window.history.replaceState(state, title, path);
};

var addPopstateListener = function (fn, opts) {
  var shouldAddHashChangeListener = opts.useHash && !supportsPopStateOnHashChange();
  window.addEventListener('popstate', fn);

  if (shouldAddHashChangeListener) {
    window.addEventListener('hashchange', fn);
  }

  return function () {
    window.removeEventListener('popstate', fn);

    if (shouldAddHashChangeListener) {
      window.removeEventListener('hashchange', fn);
    }
  };
};

var getLocation = function (opts) {
  var path = opts.useHash ? window.location.hash.replace(new RegExp('^#' + opts.hashPrefix), '') : window.location.pathname.replace(new RegExp('^' + opts.base), ''); // Fix issue with browsers that don't URL encode characters (Edge)

  var correctedPath = safelyEncodePath(path);
  return (correctedPath || '/') + window.location.search;
};

var safelyEncodePath = function (path) {
  try {
    return encodeURI(decodeURI(path));
  } catch (_) {
    return path;
  }
};

var getState = function () {
  return window.history.state;
};

var getHash = function () {
  return window.location.hash;
};

var browser = {};

if (isBrowser) {
  browser = {
    getBase: getBase,
    pushState: pushState,
    replaceState: replaceState,
    addPopstateListener: addPopstateListener,
    getLocation: getLocation,
    getState: getState,
    getHash: getHash
  };
} else {
  browser = {
    getBase: value(''),
    pushState: noop,
    replaceState: noop,
    addPopstateListener: noop,
    getLocation: value(''),
    getState: value(null),
    getHash: value('')
  };
}

var safeBrowser = browser;
var defaultOptions = {
  forceDeactivate: true,
  useHash: false,
  hashPrefix: '',
  base: '',
  mergeState: false,
  preserveHash: true
};
var source = 'popstate';

function browserPluginFactory(opts, browser) {
  if (browser === void 0) {
    browser = safeBrowser;
  }

  var options = __assign(__assign({}, defaultOptions), opts);

  var transitionOptions = {
    forceDeactivate: options.forceDeactivate,
    source: source
  };
  var removePopStateListener;
  return function browserPlugin(router) {
    var routerOptions = router.getOptions();
    var routerStart = router.start;

    router.buildUrl = function (route, params) {
      var base = options.base || '';
      var prefix = options.useHash ? "#" + options.hashPrefix : '';
      var path = router.buildPath(route, params);
      return base + prefix + path;
    };

    var urlToPath = function (url) {
      var match = url.match(/^(?:http|https):\/\/(?:[0-9a-z_\-.:]+?)(?=\/)(.*)$/);
      var path = match ? match[1] : url;
      var pathParts = path.match(/^(.+?)(#.+?)?(\?.+)?$/);
      if (!pathParts) throw new Error("[router5] Could not parse url " + url);
      var pathname = pathParts[1];
      var hash = pathParts[2] || '';
      var search = pathParts[3] || '';
      return (options.useHash ? hash.replace(new RegExp('^#' + options.hashPrefix), '') : options.base ? pathname.replace(new RegExp('^' + options.base), '') : pathname) + search;
    };

    router.matchUrl = function (url) {
      return router.matchPath(urlToPath(url));
    };

    router.start = function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      if (args.length === 0 || typeof args[0] === 'function') {
        routerStart.apply(void 0, __spreadArrays([browser.getLocation(options)], args));
      } else {
        routerStart.apply(void 0, args);
      }

      return router;
    };

    router.replaceHistoryState = function (name, params, title) {
      if (params === void 0) {
        params = {};
      }

      if (title === void 0) {
        title = '';
      }

      var route = router.buildState(name, params);
      var state = router.makeState(route.name, route.params, router.buildPath(route.name, route.params), {
        params: route.meta
      });
      var url = router.buildUrl(name, params);
      router.lastKnownState = state;
      browser.replaceState(state, title, url);
    };

    function updateBrowserState(state, url, replace) {
      var trimmedState = state ? {
        meta: state.meta,
        name: state.name,
        params: state.params,
        path: state.path
      } : state;
      var finalState = options.mergeState === true ? __assign(__assign({}, browser.getState()), trimmedState) : trimmedState;
      if (replace) browser.replaceState(finalState, '', url);else browser.pushState(finalState, '', url);
    }

    function onPopState(evt) {
      var routerState = router.getState(); // Do nothing if no state or if last know state is poped state (it should never happen)

      var newState = !evt.state || !evt.state.name;
      var state = newState ? router.matchPath(browser.getLocation(options), source) : router.makeState(evt.state.name, evt.state.params, evt.state.path, __assign(__assign({}, evt.state.meta), {
        source: source
      }), evt.state.meta.id);
      var defaultRoute = routerOptions.defaultRoute,
          defaultParams = routerOptions.defaultParams;

      if (!state) {
        // If current state is already the default route, we will have a double entry
        // Navigating back and forth will emit SAME_STATES error
        defaultRoute && router.navigateToDefault(__assign(__assign({}, transitionOptions), {
          reload: true,
          replace: true
        }));
        return;
      }

      if (routerState && router.areStatesEqual(state, routerState, false)) {
        return;
      }

      router.transitionToState(state, routerState, transitionOptions, function (err, toState) {
        if (err) {
          if (err.redirect) {
            var _a = err.redirect,
                name_1 = _a.name,
                params = _a.params;
            router.navigate(name_1, params, __assign(__assign({}, transitionOptions), {
              replace: true,
              force: true,
              redirected: true
            }));
          } else if (err.code === _router.errorCodes.CANNOT_DEACTIVATE) {
            var url = router.buildUrl(routerState.name, routerState.params);

            if (!newState) {
              // Keep history state unchanged but use current URL
              updateBrowserState(state, url, true);
            } // else do nothing or history will be messed up
            // TODO: history.back()?

          } else {
            // Force navigation to default state
            defaultRoute && router.navigate(defaultRoute, defaultParams, __assign(__assign({}, transitionOptions), {
              reload: true,
              replace: true
            }));
          }
        } else {
          router.invokeEventListeners(_router.constants.TRANSITION_SUCCESS, toState, routerState, {
            replace: true
          });
        }
      });
    }

    function onStart() {
      if (options.useHash && !options.base) {
        // Guess base
        options.base = browser.getBase();
      }

      removePopStateListener = browser.addPopstateListener(onPopState, options);
    }

    function teardown() {
      if (removePopStateListener) {
        removePopStateListener();
        removePopStateListener = undefined;
      }
    }

    function onTransitionSuccess(toState, fromState, opts) {
      var historyState = browser.getState();
      var hasState = historyState && historyState.meta && historyState.name && historyState.params;
      var statesAreEqual = fromState && router.areStatesEqual(fromState, toState, false);
      var replace = opts.replace || !hasState || statesAreEqual;
      var url = router.buildUrl(toState.name, toState.params);

      if (fromState === null && options.useHash === false && options.preserveHash === true) {
        url += browser.getHash();
      }

      updateBrowserState(toState, url, replace);
    }

    return {
      onStart: onStart,
      onStop: teardown,
      teardown: teardown,
      onTransitionSuccess: onTransitionSuccess,
      onPopState: onPopState
    };
  };
}

var _default = browserPluginFactory;
exports.default = _default;
},{"router5":"node_modules/router5/dist/index.es.js"}],"src/index.tsx":[function(require,module,exports) {
"use strict";

var _web = require("solid-js/web");

const _tmpl$ = (0, _web.template)(`<h1>About</h1>`, 2),
      _tmpl$2 = (0, _web.template)(`<p>This is the about page of the <code>solid-typefu-router5</code> example project.</p>`, 4),
      _tmpl$3 = (0, _web.template)(`<h1>Home</h1>`, 2),
      _tmpl$4 = (0, _web.template)(`<p>This is the <code>solid-typefu-router5</code> example project.</p>`, 4),
      _tmpl$5 = (0, _web.template)(`<h1>Users</h1>`, 2),
      _tmpl$6 = (0, _web.template)(`<p>Page: </p>`, 2),
      _tmpl$7 = (0, _web.template)(`<ul></ul>`, 2),
      _tmpl$8 = (0, _web.template)(`<br>`, 1),
      _tmpl$9 = (0, _web.template)(`<hr>`, 1),
      _tmpl$10 = (0, _web.template)(`<li></li>`, 2),
      _tmpl$11 = (0, _web.template)(`<h1>User <!----> profile</h1>`, 3),
      _tmpl$12 = (0, _web.template)(`<p>hello world!</p>`, 2),
      _tmpl$13 = (0, _web.template)(`<div><b>Route: </b><code></code><hr><nav class="nav"><ul><li> / </li><li></li><li></li><li></li></ul></nav><hr></div>`, 20);

var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var solid_typefu_router5_1 = __importStar(require("solid-typefu-router5"));

var router5_plugin_browser_1 = __importDefault(require("router5-plugin-browser"));

var dom_1 = require("solid-js/dom");

var router5_1 = __importDefault(require("router5"));

var solid_js_1 = require("solid-js");

var routes = [{
  name: "home",
  path: "/"
}, {
  name: "users",
  path: "/users?page",
  children: [{
    name: "profile",
    path: "/:id<\\d+>"
  }, {
    name: "edit",
    path: "/edit"
  }]
}, {
  name: "about",
  path: "/about"
}];

var _a = solid_typefu_router5_1.default({
  routes: routes,
  back: function back() {
    return window.history.back();
  },
  forward: function forward() {
    return window.history.forward();
  },
  createRouter5: function createRouter5(routes) {
    var router = router5_1.default(routes, {
      allowNotFound: true
    });
    router.usePlugin(router5_plugin_browser_1.default({
      useHash: false
    }));
    return router;
  }
}),
    Link = _a.Link,
    Router = _a.Router,
    Provider = _a.Provider;

var About = function About() {
  return [_tmpl$.cloneNode(true), _tmpl$2.cloneNode(true)];
};

var Home = function Home() {
  return [_tmpl$3.cloneNode(true), _tmpl$4.cloneNode(true)];
};

function userList(page) {
  return [5 * page, 5 * page + 1, 5 * page + 2, 5 * page + 3, 5 * page + 4];
}

var Users = function Users(props) {
  return [_tmpl$5.cloneNode(true), function () {
    var _el$6 = _tmpl$6.cloneNode(true),
        _el$7 = _el$6.firstChild;

    (0, _web.insert)(_el$6, function () {
      return props.page;
    }, null);
    return _el$6;
  }(), function () {
    var _el$8 = _tmpl$7.cloneNode(true);

    (0, _web.insert)(_el$8, (0, _web.createComponent)(solid_js_1.For, {
      get each() {
        return userList(props.page);
      },

      children: function children(user) {
        return function () {
          var _el$11 = _tmpl$10.cloneNode(true);

          (0, _web.insert)(_el$11, (0, _web.createComponent)(Link, {
            to: "users.profile",
            params: {
              id: "" + user
            },

            get children() {
              return ["To user ", user];
            }

          }));
          return _el$11;
        }();
      }
    }));
    return _el$8;
  }(), (0, _web.createComponent)(Link, {
    to: "users",

    get params() {
      return {
        page: "" + (props.page - 1)
      };
    },

    display: "button",

    get disabled() {
      return props.page <= 0;
    },

    children: "Previous page"
  }), _tmpl$8.cloneNode(true), (0, _web.createComponent)(Link, {
    to: "users",

    get params() {
      return {
        page: "" + (props.page + 1)
      };
    },

    display: "button",
    children: "Next page"
  }), _tmpl$9.cloneNode(true)];
};

var UserProfile = function UserProfile(props) {
  return [function () {
    var _el$12 = _tmpl$11.cloneNode(true),
        _el$13 = _el$12.firstChild,
        _el$15 = _el$13.nextSibling,
        _el$14 = _el$15.nextSibling;

    (0, _web.insert)(_el$12, function () {
      return props.id;
    }, _el$15);
    return _el$12;
  }(), _tmpl$12.cloneNode(true)];
};

var App = function App() {
  var route = solid_typefu_router5_1.useRoute();
  return function () {
    var _el$17 = _tmpl$13.cloneNode(true),
        _el$18 = _el$17.firstChild,
        _el$19 = _el$18.nextSibling,
        _el$20 = _el$19.nextSibling,
        _el$21 = _el$20.nextSibling,
        _el$22 = _el$21.firstChild,
        _el$23 = _el$22.firstChild,
        _el$24 = _el$23.firstChild,
        _el$25 = _el$23.nextSibling,
        _el$26 = _el$25.nextSibling,
        _el$27 = _el$26.nextSibling,
        _el$28 = _el$21.nextSibling;

    (0, _web.insert)(_el$19, function () {
      return JSON.stringify(route());
    });
    (0, _web.insert)(_el$23, (0, _web.createComponent)(Link, {
      to: "@@back",
      children: "Back"
    }), _el$24);
    (0, _web.insert)(_el$23, (0, _web.createComponent)(Link, {
      to: "@@forward",
      children: "Forward"
    }), null);
    (0, _web.insert)(_el$25, (0, _web.createComponent)(Link, {
      to: "home",
      children: "Home"
    }));
    (0, _web.insert)(_el$26, (0, _web.createComponent)(Link, {
      to: "users",
      params: {
        page: "0"
      },
      children: "Users"
    }));
    (0, _web.insert)(_el$27, (0, _web.createComponent)(Link, {
      to: "about",
      children: "About"
    }));
    (0, _web.insert)(_el$17, (0, _web.createComponent)(Router, {
      children: {
        about: {
          render: About
        },
        home: {
          render: Home
        },
        users: {
          fallback: function fallback(p) {
            var _a;

            return (0, _web.createComponent)(Users, {
              get page() {
                return Number((_a = p.params.page) !== null && _a !== void 0 ? _a : 0);
              }

            });
          },
          profile: {
            render: function render(p) {
              return (0, _web.createComponent)(UserProfile, {
                get id() {
                  return Number(p.params.id);
                }

              });
            }
          }
        }
      }
    }), null);
    return _el$17;
  }();
}; // end interesting parts


dom_1.render(function () {
  return (0, _web.createComponent)(Provider, {
    get children() {
      return (0, _web.createComponent)(App, {});
    }

  });
}, document.getElementById("app"));
},{"solid-js/web":"node_modules/solid-js/web/dist/web.js","solid-typefu-router5":"node_modules/solid-typefu-router5/dist/index.es.js","router5-plugin-browser":"node_modules/router5-plugin-browser/dist/index.es.js","solid-js/dom":"node_modules/solid-js/web/dist/web.js","router5":"node_modules/router5/dist/index.es.js","solid-js":"node_modules/solid-js/dist/solid.js"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "36425" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","src/index.tsx"], null)
//# sourceMappingURL=/src.fc45d0fd.js.map