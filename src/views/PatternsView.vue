<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 pb-16">
    <!-- Hero Header -->
    <header class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                ☕ Java 17+ Educational Showcase
              </span>
              <span class="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Spring Boot 3.3
              </span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Java Syntax &amp; Execution Patterns Lab
            </h1>
            <p class="mt-2 text-sm text-indigo-200 max-w-3xl">
              Explore rare, varied, and edge-case Java declaration shapes (explicit <code class="bg-indigo-950 px-1 py-0.5 rounded text-indigo-300">this</code> receivers, sealed hierarchies, sneaky throws, intersection types, async futures, and streams) with live interactive testing.
            </p>
          </div>

          <!-- Server connection controls -->
          <div class="bg-indigo-950/70 backdrop-blur rounded-xl p-3 border border-indigo-700/50 flex flex-col gap-2 min-w-[280px]">
            <div class="flex items-center justify-between text-xs">
              <span class="text-indigo-300 font-medium">Target Backend URL:</span>
              <span :class="serverHealthy ? 'text-emerald-400' : 'text-amber-400'" class="flex items-center gap-1 font-semibold">
                <span class="w-2 h-2 rounded-full" :class="serverHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"></span>
                {{ serverHealthy ? 'Connected' : 'Offline / Checking' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="backendBaseUrl"
                type="text"
                class="flex-1 px-2.5 py-1 text-xs font-mono bg-indigo-900/60 border border-indigo-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="http://localhost:5002"
              />
              <button
                @click="checkHealth"
                class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
              >
                Ping
              </button>
            </div>
          </div>
        </div>

        <!-- Quick navigation categories -->
        <div class="mt-6 flex flex-wrap gap-2 border-t border-indigo-800/80 pt-4">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            :class="selectedCategory === cat.id
              ? 'bg-white text-indigo-900 shadow-sm'
              : 'bg-indigo-800/50 hover:bg-indigo-700/60 text-indigo-100'"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="selectedCategory === cat.id ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-900/60 text-indigo-300'">
              {{ cat.endpoints.length }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{{ currentCategoryMeta.icon }}</span>
            {{ currentCategoryMeta.label }}
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ currentCategoryMeta.description }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="runAllInCurrentCategory"
            :disabled="runningBatch"
            class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span v-if="runningBatch" class="animate-spin">⏳</span>
            <span v-else>⚡</span>
            {{ runningBatch ? 'Running All...' : 'Run All in Group' }}
          </button>
          <button
            @click="clearAllResults"
            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition"
          >
            Clear Responses
          </button>
        </div>
      </div>

      <!-- Endpoint List Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="ep in filteredEndpoints"
          :key="ep.id"
          class="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between transition hover:border-indigo-300 hover:shadow"
        >
          <!-- Card Header -->
          <div class="p-5 border-b border-slate-100 bg-slate-50/50">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase"
                    :class="ep.method === 'POST' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'"
                  >
                    {{ ep.method }}
                  </span>
                  <span class="font-mono text-xs font-bold text-slate-800 select-all">{{ ep.path }}</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 mt-1.5">{{ ep.title }}</h3>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ ep.description }}</p>
              </div>

              <!-- Concepts tags -->
              <div class="flex flex-wrap gap-1 justify-end max-w-[140px]">
                <span
                  v-for="tag in ep.tags"
                  :key="tag"
                  class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Param inputs if any -->
            <div v-if="ep.params && ep.params.length > 0" class="mt-3.5 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div v-for="param in ep.params" :key="param.name" class="flex flex-col gap-1">
                <label class="text-[11px] font-semibold text-slate-500 font-mono">{{ param.name }} ({{ param.type }})</label>
                <input
                  v-model="paramValues[ep.id + '_' + param.name]"
                  :type="param.type === 'number' ? 'number' : 'text'"
                  class="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  :placeholder="param.default"
                />
              </div>
            </div>
          </div>

          <!-- Card Body / Response Output -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Live Response:</span>
                <div v-if="responses[ep.id]" class="flex items-center gap-2">
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                    :class="responses[ep.id].ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ responses[ep.id].status }}
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">{{ responses[ep.id].duration }}ms</span>
                  <button
                    @click="copyResponse(ep.id)"
                    class="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium transition"
                  >
                    {{ copiedId === ep.id ? '✓ Copied' : 'Copy' }}
                  </button>
                </div>
              </div>

              <!-- Result container -->
              <div class="relative bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-100 min-h-[110px] max-h-[220px] overflow-auto border border-slate-800">
                <div v-if="loading[ep.id]" class="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-slate-300 gap-2">
                  <span class="animate-spin">⏳</span> Executing on Spring Boot...
                </div>
                <pre v-else-if="responses[ep.id]" class="whitespace-pre-wrap break-all text-[11px]">{{ responses[ep.id].body }}</pre>
                <div v-else class="text-slate-500 italic flex items-center justify-center h-full pt-6">
                  Click "Test Request" to execute this pattern on Java 17
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">No Postman or curl needed</span>
              <button
                @click="executeEndpoint(ep)"
                :disabled="loading[ep.id]"
                class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span>⚡</span>
                {{ loading[ep.id] ? 'Running...' : 'Test Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

interface ParamDef {
  name: string
  type: string
  default: string
}

interface EndpointDef {
  id: string
  category: string
  method: 'GET' | 'POST'
  path: string
  title: string
  description: string
  tags: string[]
  params?: ParamDef[]
}

const backendBaseUrl = ref('http://localhost:5002')
const serverHealthy = ref(false)
const selectedCategory = ref('all')
const loading = ref<Record<string, boolean>>({})
const responses = ref<Record<string, { ok: boolean; status: string; duration: number; body: string }>>({})
const paramValues = ref<Record<string, string>>({})
const runningBatch = ref(false)
const copiedId = ref<string | null>(null)

const categories = [
  { id: 'all', label: 'All Patterns', icon: '🌌', description: 'Complete library of Java 17 method execution and declaration patterns.' },
  { id: 'torture', label: 'Parser & Syntax Oddities', icon: '🧪', description: 'Explicit receivers (this), intersection casts, nested lambdas, and Unicode identifiers.' },
  { id: 'matching', label: 'Pattern Matching & Sealed', icon: '🧩', description: 'Java 17 sealed hierarchies, record destructuring, instanceof guards, and switch expressions.' },
  { id: 'streams', label: 'Streams & Iterators', icon: '🌊', description: 'Lazy sequences, hand-crafted Iterators, infinite generators, and custom Spliterators.' },
  { id: 'generics', label: 'Generics & Shadowing', icon: '🧬', description: 'Recursive bounds, covariant/contravariant wildcards, and type parameter shadowing.' },
  { id: 'oop', label: 'OOP & Overloads', icon: '🏛️', description: 'Multi-bound overloading, strictfp, covariant return types, and enum polymorphism.' },
  { id: 'lifecycle', label: 'Lifecycle & Resources', icon: '🔄', description: 'Try-with-resources effectively final, static/instance blocks, and Cleaner API.' },
  { id: 'functional', label: 'Functional & Currying', icon: 'λ', description: 'Higher-order functions, curried addition, closures, and method references.' },
  { id: 'async', label: 'Async & Concurrency', icon: '⚡', description: 'CompletableFuture pipelines, Callables, DeferredResults, and Fork/Join pools.' },
]

const endpoints: EndpointDef[] = [
  // ── Parser Torture & Rare Syntax
  {
    id: 'torture_main',
    category: 'torture',
    method: 'GET',
    path: '/api/v1/patterns/torture',
    title: 'Torture Patterns Showcase',
    description: 'Runs explicit receiver "this", intersection types (&), labeled loops, and type parameter shadowers.',
    tags: ['Explicit "this"', 'Intersection &', 'Unicode', 'Self-builder'],
  },
  {
    id: 'torture_switch',
    category: 'torture',
    method: 'GET',
    path: '/api/v1/patterns/torture/switch',
    title: 'Switch Expression vs Classic Statement',
    description: 'Compares Java 17 arrow labels with yield blocks against fallthrough switch statements.',
    tags: ['yield', 'Arrow Switch', 'Fallthrough'],
    params: [{ name: 'code', type: 'number', default: '2' }],
  },

  // ── Pattern Matching & Sealed Records
  {
    id: 'matching_main',
    category: 'matching',
    method: 'GET',
    path: '/api/v1/patterns/matching',
    title: 'Pattern Matching & Sealed Records',
    description: 'Exhaustive instanceof pattern chains over sealed Shape hierarchy (Circle, Square, Rectangle).',
    tags: ['sealed', 'instanceof', 'records', 'TextBlock'],
    params: [{ name: 'value', type: 'number', default: '42' }],
  },

  // ── Streams & Iterators
  {
    id: 'streams_main',
    category: 'streams',
    method: 'GET',
    path: '/api/v1/patterns/streams',
    title: 'Streams & Custom Iterators',
    description: 'Eager vs lazy evaluation, Fibonacci generator, Spliterator, and BlockingQueue async streams.',
    tags: ['Spliterator', 'Lazy Stream', 'BlockingQueue', 'Collectors'],
  },

  // ── Generics & Nesting
  {
    id: 'generics_main',
    category: 'generics',
    method: 'GET',
    path: '/api/v1/patterns/generics',
    title: 'Generics, Shadowing & Erasure',
    description: 'Inner class type parameter deliberately shadowing outer type, plus erasure verification.',
    tags: ['Shadowing', 'Erasure', 'CRTP Builder', 'Wildcards'],
  },

  // ── OOP & Overloads
  {
    id: 'oop_main',
    category: 'oop',
    method: 'GET',
    path: '/api/v1/patterns/oop',
    title: 'OOP Hierarchy & Polymorphism',
    description: 'Covariant return overrides, interface private static methods, and enum constant-specific class bodies.',
    tags: ['Covariant', 'Interface Private', 'Polymorphic Enum'],
  },
  {
    id: 'oop_overloads',
    category: 'oop',
    method: 'GET',
    path: '/api/v1/patterns/oop/overloads',
    title: 'Overload Resolution Matrix',
    description: 'Resolves method calls across primitives, boxed types, CharSequence, and varargs.',
    tags: ['Overloading', 'Autoboxing', 'Varargs'],
    params: [{ name: 'value', type: 'number', default: '7' }],
  },

  // ── Lifecycle & Resources
  {
    id: 'lifecycle_main',
    category: 'lifecycle',
    method: 'GET',
    path: '/api/v1/patterns/lifecycle',
    title: 'Object Lifecycle & AutoCloseable',
    description: 'Demonstrates instance initializers, static blocks, Cleaner API, and try-with-resources.',
    tags: ['try-with-resources', 'Instance Init', 'Cleaner'],
  },
  {
    id: 'lifecycle_guarded',
    category: 'lifecycle',
    method: 'GET',
    path: '/api/v1/patterns/lifecycle/guarded',
    title: 'Guarded Calls & Multi-Catch',
    description: 'Multi-catch block behavior and finally clause execution modes (ok, npe, iae).',
    tags: ['Multi-catch', 'finally', 'Exceptions'],
    params: [{ name: 'mode', type: 'string', default: 'ok' }],
  },

  // ── Functional & Lambdas
  {
    id: 'functional_main',
    category: 'functional',
    method: 'GET',
    path: '/api/v1/patterns/functional',
    title: 'Functional Lambdas & Recursion',
    description: 'Curried functions, block lambdas, primitive specializations, and tail recursion.',
    tags: ['Currying', 'Primitive Lambda', 'Recursion'],
  },
  {
    id: 'functional_higher_order',
    category: 'functional',
    method: 'GET',
    path: '/api/v1/patterns/functional/higher-order',
    title: 'Higher-Order Functions',
    description: 'Functions that take functions and return closures with prefixes and logging wrappers.',
    tags: ['Higher-Order', 'Closures', 'Function<T,R>'],
    params: [{ name: 'input', type: 'string', default: 'abc' }],
  },

  // ── Synchronous & Asynchronous
  {
    id: 'sync_main',
    category: 'async',
    method: 'GET',
    path: '/api/v1/patterns/sync',
    title: 'Synchronous Method Flavours',
    description: 'Standard, delegating, synchronized, final, and static Java method signatures.',
    tags: ['synchronized', 'final', 'static'],
  },
  {
    id: 'async_main',
    category: 'async',
    method: 'GET',
    path: '/api/v1/patterns/async',
    title: 'CompletableFuture Pipelines',
    description: 'Composed async execution, timeouts, whenAll, whenAny, and custom thread pool executors.',
    tags: ['CompletableFuture', 'allOf', 'anyOf', 'Executors'],
  },
  {
    id: 'async_callable',
    category: 'async',
    method: 'GET',
    path: '/api/v1/patterns/async/callable',
    title: 'Spring MVC Callable<T>',
    description: 'Asynchronous controller execution where the servlet container awaits value on another thread.',
    tags: ['Callable', 'Async Servlet'],
  },
  {
    id: 'async_deferred',
    category: 'async',
    method: 'GET',
    path: '/api/v1/patterns/async/deferred',
    title: 'DeferredResult<T>',
    description: 'Asynchronous event-driven response completed asynchronously by a worker thread.',
    tags: ['DeferredResult', 'Reactive Event'],
  },
  {
    id: 'async_fire_and_forget',
    category: 'async',
    method: 'POST',
    path: '/api/v1/patterns/async/fire-and-forget',
    title: 'Fire-and-Forget Pattern',
    description: 'Returns immediately to caller while the background task completes independently.',
    tags: ['Background Worker', 'Non-blocking'],
    params: [{ name: 'message', type: 'string', default: 'Hello Java' }],
  },
]

const currentCategoryMeta = computed(() => {
  return categories.find((c) => c.id === selectedCategory.value) || categories[0]
})

const filteredEndpoints = computed(() => {
  if (selectedCategory.value === 'all') return endpoints
  return endpoints.filter((e) => e.category === selectedCategory.value)
})

const checkHealth = async () => {
  try {
    const res = await axios.get(`${backendBaseUrl.value}/api/v1/patterns`, { timeout: 3000 })
    serverHealthy.value = res.status === 200
  } catch {
    serverHealthy.value = false
  }
}

const executeEndpoint = async (ep: EndpointDef) => {
  loading.value[ep.id] = true
  const startTime = performance.now()

  try {
    // Build query params
    const queryParams: Record<string, string> = {}
    if (ep.params) {
      for (const p of ep.params) {
        const val = paramValues.value[ep.id + '_' + p.name]
        queryParams[p.name] = val !== undefined && val !== '' ? val : p.default
      }
    }

    let url = `${backendBaseUrl.value}${ep.path}`
    let res: any

    if (ep.method === 'POST') {
      res = await axios.post(url, null, { params: queryParams, timeout: 8000 })
    } else {
      res = await axios.get(url, { params: queryParams, timeout: 8000 })
    }

    const duration = Math.round(performance.now() - startTime)
    responses.value[ep.id] = {
      ok: true,
      status: `${res.status} ${res.statusText || 'OK'}`,
      duration,
      body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2),
    }
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime)
    const status = err.response ? `${err.response.status} ${err.response.statusText}` : 'Network Error'
    const body = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message
    responses.value[ep.id] = {
      ok: false,
      status,
      duration,
      body,
    }
  } finally {
    loading.value[ep.id] = false
  }
}

const runAllInCurrentCategory = async () => {
  runningBatch.value = true
  const list = filteredEndpoints.value
  for (const ep of list) {
    await executeEndpoint(ep)
  }
  runningBatch.value = false
}

const clearAllResults = () => {
  responses.value = {}
}

const copyResponse = async (id: string) => {
  if (!responses.value[id]) return
  await navigator.clipboard.writeText(responses.value[id].body)
  copiedId.value = id
  setTimeout(() => {
    copiedId.value = null
  }, 2000)
}

onMounted(() => {
  // Initialize default param values
  for (const ep of endpoints) {
    if (ep.params) {
      for (const p of ep.params) {
        paramValues.value[ep.id + '_' + p.name] = p.default
      }
    }
  }
  checkHealth()
})
</script>
