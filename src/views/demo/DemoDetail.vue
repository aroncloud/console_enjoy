<template>
  <div class=" bg-slate-50 dark:bg-slate-950">

    <!-- Header -->
    <div class="bg-white dark:bg-slate-900 border-b border-slate-200 rounded-lg dark:border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button @click="router.back()" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ArrowLeft :size="18" />
          </button>
          <div class="min-w-0">
            <h1 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ demo?.contactName }}</h1>
            <p class="text-xs text-slate-500 truncate">{{ demo?.companyName }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="demo" :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', statusConfig[demo.status as DemoStatus]?.classes]">
            {{ statusConfig[demo.status as DemoStatus]?.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-1 space-y-4">
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div class="h-2.5 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <div v-for="i in 6" :key="i" class="flex items-center gap-3">
        <div class="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
        <div class="h-2.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" :style="{ width: `${50 + (i * 13) % 35}%` }" />
      </div>
    </div>
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div class="h-2.5 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
        <div class="space-y-1.5 flex-1">
          <div class="h-2.5 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div class="h-2 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
  <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
    <div class="h-2.5 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
    <div v-for="i in 4" :key="i" class="flex gap-4">
      <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
      <div class="flex-1 space-y-2 pt-1">
        <div class="h-2.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" :style="{ width: `${40 + (i * 17) % 40}%` }" />
        <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" :style="{ width: `${55 + (i * 11) % 30}%` }" />
      </div>
      <div class="h-2 w-14 bg-slate-100 dark:bg-slate-800 rounded animate-pulse shrink-0 mt-1" />
    </div>
  </div>
</div>

    <div v-else-if="demo" class="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Colonne gauche : infos + commercial -->
      <div class="lg:col-span-1 space-y-4">

        <!-- Infos prospect -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ $t('demos.history.lead') }}</h3>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-3 text-sm">
              <Mail :size="14" class="text-slate-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-200 truncate">{{ demo.email }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Phone :size="14" class="text-slate-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-200">{{ demo.phoneNumber || '—' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Globe :size="14" class="text-slate-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-200">{{ demo.country || '—' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <BedDouble :size="14" class="text-slate-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-200">{{ demo.numberOfRooms || 0 }} chambres</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Building2 :size="14" class="text-slate-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-200">{{ demo.propertyType || $t('demos.fields.typeNotSpecified') }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Calendar :size="14" class="text-slate-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-200">{{ formatDate(demo.createdAt) }}</span>
            </div>
            <div v-if="demo.competition" class="flex items-center gap-3 text-sm">
              <Swords :size="14" class="text-slate-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-200">{{ demo.competition }}</span>
            </div>
          </div>
        </div>

        <!-- Commercial assigné -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ $t('demos.history.assign') }}</h3>
          </div>
          <div class="p-4">
            <div v-if="demo.owner" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <UserCheck :size="18" class="text-purple-500" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-white">
                  {{ demo.owner.fullName || `${demo.owner.firstName} ${demo.owner.lastName}`.trim() }}
                </p>
                <p class="text-xs text-slate-400">{{ demo.owner.email }}</p>
                <p v-if="demo.owner.role?.roleName" class="text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded mt-1 inline-block">
                  {{ demo.owner.role.roleName }}
                </p>
              </div>
            </div>
            <div v-else class="flex items-center gap-2 text-sm text-slate-400">
              <UserX :size="16" />
              <span>{{ $t('demos.history.noSalesAssigned') }}</span>
            </div>
          </div>
        </div>

        <!-- Date de démo planifiée -->
        <div v-if="demo.followUpDate" class="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div class="flex items-center gap-2 mb-1">
            <CalendarClock :size="14" class="text-blue-500" />
            <span class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{{ $t('demos.history.planified') }}</span>
          </div>
          <p class="text-sm font-semibold text-blue-800 dark:text-blue-200">{{ formatDate(demo.followUpDate) }}</p>
        </div>

      </div>

      <!-- Colonne droite : timeline historique -->
<div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
  <div class="flex items-center gap-2 mb-4">
    <ClipboardList class="w-4 h-4 text-slate-400" />
    <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
      {{ $t('demos.history.title') }}
    </h2>
    <span class="ml-auto text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
      {{ timeline.length }}
    </span>
  </div>

  <!-- Skeleton -->
  <div v-if="loadingHistory" class="space-y-4">
    <div v-for="i in 4" :key="i" class="flex gap-4">
      <div class="flex flex-col items-center gap-1">
        <div class="w-2.5 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0 mt-1" />
        <div class="w-px flex-1 bg-slate-100 dark:bg-slate-800 animate-pulse" style="min-height: 32px" />
      </div>
      <div class="flex-1 space-y-1.5 pb-4">
        <div class="h-2.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" :style="{ width: `${35 + (i * 19) % 45}%` }" />
        <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" :style="{ width: `${50 + (i * 11) % 30}%` }" />
        <div class="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  </div>

  <!-- Vide -->
  <div v-else-if="timeline.length === 0" class="text-sm text-slate-400 text-center py-6">
   {{ $t('demos.history.noActivity') }}
  </div>

  <!-- Liste -->
  <div v-else>
    <div class="relative">
      <div v-for="(event, index) in paginatedTimeline" :key="index" class="flex gap-4 pb-4">
        <div class="flex flex-col items-center">
          <div :class="['w-2.5 h-2.5 rounded-full shrink-0 mt-1', event.dotColor]" />
          <div v-if="index < paginatedTimeline.length - 1" class="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
        </div>
        <div class="flex-1 pb-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 dark:text-white">{{ event.title }}</p>
          <p v-if="event.description" class="text-xs text-slate-400 truncate mt-0.5">{{ event.description }}</p>
          <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            <Clock class="w-3 h-3" />
            <span>{{ event.date }}</span>
            <span v-if="event.actor" class="truncate">· {{ event.actor }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalHistoryPages > 1" class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
      <span class="text-xs text-slate-400">Page {{ historyPage }} / {{ totalHistoryPages }}</span>
      <div class="flex items-center gap-1">
        <button
          @click="historyPage--"
          :disabled="historyPage === 1"
          class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >{{ $t('common.previous') }}</button>
        <button
          @click="historyPage++"
          :disabled="historyPage === totalHistoryPages"
          class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >{{ $t('common.next') }}</button>
      </div>
    </div>
  </div>
</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft, Mail, Phone, Globe, BedDouble, Building2,
  Calendar, CalendarClock, UserCheck, UserX,
  ClipboardList, Clock, Swords,
} from 'lucide-vue-next'
import { demoService } from '../../servicesAPI/demoService'
import type { DemoStatus } from '../../servicesAPI/demoService'
import { historyService } from '../../servicesAPI/historyService'
import { useToastStore } from '../../composables/toast'

const route   = useRoute()
const router  = useRouter()
const { t, locale } = useI18n()
const toastStore       = useToastStore()

const demo           = ref<any>(null)
const loading        = ref(false)
const loadingHistory = ref(false)
const history        = ref<any[]>([])
const historyPage       = ref(1)
const historyPerPage    = 7
const totalHistoryPages = computed(() => Math.ceil(timeline.value.length / historyPerPage))
const paginatedTimeline = computed(() => {
  const start = (historyPage.value - 1) * historyPerPage
  return timeline.value.slice(start, start + historyPerPage)
})


// ── Status config (même que DemoView) ─────────────
const statusConfig = computed<Record<DemoStatus, { label: string; classes: string }>>(() => ({
  New:             { label: t('demos.status.new'),           classes: 'bg-blue-100 text-blue-800' },
  Qualified:       { label: t('demos.status.qualified'),     classes: 'bg-purple-100 text-purple-800' },
  'Demo Scheduled':{ label: t('demos.status.demoScheduled'), classes: 'bg-amber-100 text-amber-800' },
  'Demo Completed':{ label: t('demos.status.demoCompleted'), classes: 'bg-cyan-100 text-cyan-800' },
  Trial:           { label: t('demos.status.inTesting'),     classes: 'bg-indigo-100 text-indigo-800' },
  Negotiation:     { label: t('demos.status.negotiation'),   classes: 'bg-orange-100 text-orange-800' },
  Converted:       { label: t('demos.status.converted'),     classes: 'bg-emerald-100 text-emerald-800' },
  Lost:            { label: t('demos.status.lost'),          classes: 'bg-rose-100 text-rose-800' },
  Junk:            { label: t('demos.status.junk'),          classes: 'bg-slate-100 text-slate-500' },
}))



const timeline = computed(() => {
  return history.value.map((entry: any) => {
    const action  = entry.action ?? ''
    const changes = entry.changes ?? {}

    const actionLabels: Record<string, string> = {
        'request_demo.create':       t('demos.history.actions.create'),
        'request_demo.update':       t('demos.history.actions.update'),
        'request_demo.assign':       t('demos.history.actions.assign'),
        'request_demo.resend_email': t('demos.history.actions.resendEmail'),
        'request_demo.convert':      t('demos.history.actions.convert'),
        'request_demo.lost':         t('demos.history.actions.lost'),
        'request_demo.schedule':     t('demos.history.actions.schedule'),
        'request_demo.complete':     t('demos.history.actions.complete'),
        'request_demo.delete':       t('demos.history.actions.delete'),
    }

    // Dans le timeline computed :
    const title = actionLabels[action] ?? action

    const changeParts: string[] = []

    const statusVal = typeof changes.status === 'object'
      ? changes.status?.new
      : changes.status

    if (statusVal) {
      changeParts.push(`${t('demos.history.fields.status')} → ${statusConfig.value[statusVal as DemoStatus]?.label ?? statusVal}`)
    }

    if (changes.ownerId?.new)          changeParts.push(t('demos.history.fields.ownerAssigned'))
    if (changes.followUpDate?.new)     changeParts.push(`${t('demos.history.fields.followUpDate')} : ${formatDate(changes.followUpDate.new)}`)
    if (changes.notesMessage?.new)     changeParts.push(changes.notesMessage.new)
    if (changes.competition?.new)      changeParts.push(`${t('demos.history.fields.competition')} : ${changes.competition.new}`)

    const description = changeParts.length > 0
      ? changeParts.join(' · ')
      : (entry.description ?? '')

    const dotColor = statusVal ? (statusDotColor[statusVal] ?? 'bg-slate-300') : 'bg-slate-300'

    return {
      title,
      description,
      date:     formatDate(entry.createdAt),
      actor:    entry.user?.fullName ?? entry.username ?? null,
      dotColor,
    }
  })
})

// ── Fetch ─────
const fetchDemo = async () => {
  loading.value = true
  try {
    const res = await demoService.getById(Number(route.params.id))
    console.log(res)
    demo.value = res
  } catch (e) {
    console.error(e)
    toastStore.show({ message: t('demos.toast.loadError'), type: 'error' })
  } finally {
    loading.value = false
  }
}

const fetchHistory = async () => {
  loadingHistory.value = true
  try {
    const res = await historyService.getAllDemo(Number(route.params.id))
    console.log('res',res)
    history.value = res.data ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loadingHistory.value = false
  }
}


// Adapte le computed timeline — remplace dotClass par dotColor (string simple)
const statusDotColor: Record<string, string> = {
  New:             'bg-blue-400',
  Qualified:       'bg-purple-400',
  'Demo Scheduled':'bg-amber-400',
  'Demo Completed':'bg-cyan-400',
  Trial:           'bg-indigo-400',
  Negotiation:     'bg-orange-400',
  Converted:       'bg-emerald-400',
  Lost:            'bg-rose-400',
  Junk:            'bg-slate-400',
}




const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—'

onMounted(() => {
  fetchDemo()
  fetchHistory()
})
</script>
