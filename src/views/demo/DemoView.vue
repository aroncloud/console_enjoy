<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from "vue";
import { useI18n } from 'vue-i18n'
import {
  Search,
  CheckCircle,
  Mail,
  MailCheck,
  Eye,
  Plus,
  BedDouble,
  ArrowRight,
  UserCheck,
  ChevronRight,
  MonitorPlay
} from "lucide-vue-next";

import Input from "../../components/FormElements/Input.vue";
import ButtonComponent from "../../components/Button/ButtonComponent.vue";
import BaseTable from "../../components/Table/BaseTable.vue";
import type { Column } from "../../components/Table/BaseTable.vue";
import BaseModal from "../../components/Modal/BaseModal.vue";
import Select from "../../components/FormElements/Select.vue";
import { useToastStore } from "../../composables/toast";
import { demoService } from "../../servicesAPI/demoService";
import type {
  Demo,
  DemoStatus,
  UpdateDemoPayload,
} from "../../servicesAPI/demoService";
import { userService } from "../../servicesAPI/userService";
import { useRouter } from "vue-router";

const router = useRouter();
// --- ÉTATS GLOBAUX ---
const demos = ref<Demo[]>([]);
const allDemos = ref<Demo[]>([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref("");
const filterStatus = ref<DemoStatus | "all">("all");
const toastStore = useToastStore();
const { t } = useI18n()
const page = ref(1);
const limit = ref(20);
const meta = ref<any>(null);
const users = ref<any[]>([]);

// --- ÉTATS DES MODALES ---
const showWorkflowModal = ref(false);
const currentDemo = ref<Demo | null>(null);
const currentStep = ref<
  "qualify" | "schedule" | "complete" | "negotiate" | "lost" | "convert" | null
>(null);

// Formulaire unique pour le workflow
const workflowForm = reactive({
  numberOfRooms: 0,
  propertyType: "",
  followUpDate: "",
  ownerId: null as number | null,
  notesMessage: "",
  competition: "",
  status: "New" as DemoStatus,
  // Champs pour l'édition générale
  contactName: "",
  companyName: "",
  email: "",
  phoneNumber: "",
  country: "",
});

// --- CONFIGURATION DU WORKFLOW ---
type StepType =
  | "qualify"
  | "schedule"
  | "complete"
  | "negotiate"
  | "lost"
  | "convert"
  | undefined;

const statusConfig = computed<Record<DemoStatus, { label: string; classes: string; nextLabel?: string; nextStep?: StepType }>>(() => ({
  New: {
    label: t('demos.status.new'),
    classes: "bg-blue-100 text-blue-800",
    nextLabel: t('demos.status.contacted'),
    nextStep: "qualify",
  },
  Qualified: {
    label: t('demos.status.qualified'),
    classes: "bg-purple-100 text-purple-800",
    nextLabel: t('demos.status.demoScheduled'),
    nextStep: "schedule",
  },
  "Demo Scheduled": {
    label: t('demos.status.demoScheduled'),
    classes: "bg-amber-100 text-amber-800",
    nextLabel: t('demos.status.demoCompleted'),
    nextStep: "complete",
  },
  "Demo Completed": {
    label: t('demos.status.demoCompleted'),
    classes: "bg-cyan-100 text-cyan-800",
    nextLabel: t('demos.status.negotiation'),
    nextStep: "negotiate",
  },
  Trial: {
    label: t('demos.status.inTesting'),
    classes: "bg-indigo-100 text-indigo-800",
    nextLabel: t('demos.status.converted'),
    nextStep: "convert",
  },
  Negotiation: {
    label: t('demos.status.negotiation'),
    classes: "bg-orange-100 text-orange-800",
    nextLabel: t('demos.status.converted'),
    nextStep: "convert",
  },
  Converted: { label: t('demos.status.converted'), classes: "bg-emerald-100 text-emerald-800" },
  Lost: { label: t('demos.status.lost'), classes: "bg-rose-100 text-rose-800" },
  Junk: { label: t('demos.status.junk'), classes: "bg-slate-100 text-slate-500" },
}))

const workflowConfig = computed(() => {
  const map = {
    qualify:  { title: t('demos.workflow.qualify.title'),  btn: t('demos.workflow.qualify.btn'),  color: 'primary' },
    schedule: { title: t('demos.workflow.schedule.title'), btn: t('demos.workflow.schedule.btn'), color: 'primary' },
    complete: { title: t('demos.workflow.complete.title'), btn: t('demos.workflow.complete.btn'), color: 'primary' },
    negotiate:{ title: t('demos.workflow.negotiate.title'),btn: t('demos.workflow.negotiate.btn'),color: 'primary' },
    convert:  { title: t('demos.workflow.convert.title'), btn: t('demos.workflow.convert.btn'),  color: 'success' },
    lost:     { title: t('demos.workflow.lost.title'),    btn: t('demos.workflow.lost.btn'),     color: 'danger'  },
  }
  return currentStep.value ? map[currentStep.value] : map.qualify
})

const columns = computed<Column[]>(() => [
  { key: 'contact', label: t('demos.table.contact') },
  { key: 'company', label: t('demos.table.company') },
  { key: 'status',  label: t('demos.table.currentStatus') },
  { key: 'next',    label: t('demos.table.nextAction') },
  { key: 'actions', label: t('common.actions'), sortable: false },
])

// --- LOGIQUE API ---
const fetchDemos = async (p = 1) => {
  loading.value = true;
  try {
    const res = await demoService.getAll({
      page: p,
      limit: limit.value,
      search: searchQuery.value || undefined,
      status: filterStatus.value === "all" ? undefined : filterStatus.value,
    });
    console.log('meta:', res.meta)
    demos.value = res.data;
    meta.value = res.meta
  } catch (e) {
    toastStore.show({
      type: "error",
      message: t('demos.toast.loadError'),
    });
  } finally {
    loading.value = false;
  }
};

const handleDetail = (row: any) => {
  router.push({ name: 'demo-detail', params: { id: row.id } })
}

const fetchAllDemos = async () => {
  try {
    const res = await demoService.getAll({ all: true });
    allDemos.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

// Chargement des utilisateurs (commerciaux)
const fetchUsers = async () => {
  try {
    const res = await userService.getCommercial();
    console.log("res", res);
    users.value = res.map((u: any) => ({
      label:
        u.fullname ||
        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
        u.email ||
        "Sans nom",
      value: u.id,
    }));
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchDemos(1);
  fetchAllDemos();
  fetchUsers();
});

watch([searchQuery, filterStatus], () => {
  page.value = 1;
  fetchDemos(1);
});
watch(page, (p) => fetchDemos(p));



// --- GESTION DU WORKFLOW ---
const openModal = (demo: any, step: StepType) => {
  currentDemo.value = demo;
  currentStep.value = step || null;
  workflowForm.status = "Qualified";
  workflowForm.contactName = demo.contactName;
  workflowForm.companyName = demo.companyName;
  workflowForm.email = demo.email;
  workflowForm.phoneNumber = demo.phoneNumber || "";
  workflowForm.country = demo.country || "";
  workflowForm.numberOfRooms = demo.numberOfRooms || 0;
  workflowForm.propertyType = demo.propertyType || "";
  workflowForm.followUpDate = demo.followUpDate
    ? demo.followUpDate.substring(0, 16)
    : "";
  workflowForm.ownerId = demo.ownerId;
  workflowForm.notesMessage = "";
  workflowForm.competition = demo.competition || "";
  showWorkflowModal.value = true;
};

const handleSubmit = async () => {
  if (!currentDemo.value || !currentStep.value) return
  saving.value = true
  let payload: Partial<UpdateDemoPayload> = {}

  try {
    if (currentStep.value === 'qualify') {
      payload = {
        status: workflowForm.status === 'Lost' ? 'Lost' : 'Qualified',
        contactName: workflowForm.contactName,
        companyName: workflowForm.companyName,
        email: workflowForm.email,
        phoneNumber: workflowForm.phoneNumber,
        country: workflowForm.country,
        numberOfRooms: workflowForm.numberOfRooms,
        propertyType: workflowForm.propertyType,
        ...(workflowForm.status === 'Lost' && workflowForm.notesMessage
          ? { notesMessage: `${t('demos.workflow.lostPrefix')}${workflowForm.notesMessage}` }
          : {}),
      }
    } else if (currentStep.value === 'schedule') {
      if (!workflowForm.followUpDate)
        throw new Error(t('demos.workflow.errors.dateRequired'))
      if (!workflowForm.ownerId)
        throw new Error(t('demos.workflow.errors.ownerRequired'))
      payload = {
        status: 'Demo Scheduled',
        followUpDate: workflowForm.followUpDate,
        ownerId: workflowForm.ownerId,
      }
    } else if (currentStep.value === 'complete') {
      if (!workflowForm.notesMessage)
        throw new Error(t('demos.workflow.errors.demoNotesRequired'))
      payload = {
        status: 'Demo Completed',
        notesMessage: workflowForm.notesMessage,
        competition: workflowForm.competition,
      }
    } else if (currentStep.value === 'negotiate') {
      payload = { status: 'Negotiation' }
    } else if (currentStep.value === 'convert') {
      showWorkflowModal.value = false
      router.push({
        path: '/clients',
        state: {
          openHotelForm: true,
          demoId: currentDemo.value.id,
          prefill: {
            companyName: currentDemo.value.companyName,
            email: currentDemo.value.email,
            phoneNumber: currentDemo.value.phoneNumber,
            country: currentDemo.value.country,
            numberOfRooms: currentDemo.value.numberOfRooms,
            contactName: currentDemo.value.contactName,
          },
        },
      })
      return
    } else if (currentStep.value === 'lost') {
      if (!workflowForm.notesMessage)
        throw new Error(t('demos.workflow.errors.lostReasonRequired'))
      payload = {
        status: 'Lost',
        notesMessage: `${t('demos.workflow.lostPrefix')}${workflowForm.notesMessage}`,
      }
    }

    await demoService.update(currentDemo.value.id, payload)
    toastStore.show({ message: t('demos.toast.success'), type: 'success' })
    showWorkflowModal.value = false
    fetchDemos(page.value)
    fetchAllDemos()
  } catch (e: any) {
    toastStore.show({ message: e.message || t('demos.toast.error'), type: 'error' })
  } finally {
    saving.value = false
  }
}


const handleResendEmail = async (id: number) => {
  try {
    await demoService.resendEmail(id);
    toastStore.show({ message: t('demos.toast.emailResent'), type: "success" });
    fetchDemos(page.value);
  } catch (e) {
    toastStore.show({
      message: t('demos.toast.emailResendError'),
      type: "error",
    });
  }
};


const showAddModal = ref(false)
const addSaving = ref(false)

const addForm = reactive({
  contactName: '',
  companyName: '',
  email: '',
  phoneNumber: '',
  country: '',
  numberOfRooms: 1,
  propertyType: '',
  preferredLanguage: '',
  leadSource: '',
  notesMessage: '',
  competition: '',
  acceptCondition: false,
})

const handleAddDemo = async () => {
  addSaving.value = true
  try {
    await demoService.create(addForm)
    toastStore.show({ message: t('demos.toast.addSuccess'), type: 'success' })
    showAddModal.value = false
    Object.assign(addForm, {
      contactName: '', companyName: '', email: '',
      phoneNumber: '', country: '', numberOfRooms: 0,
      propertyType: '', preferredLanguage: '', leadSource: '',
      notesMessage: '', competition: '', acceptCondition: false,
    })
    fetchDemos(1)
    fetchAllDemos()
  } catch (e: any) {
    toastStore.show({ message: e.message || t('demos.toast.errorCreated'), type: 'error' })
  } finally {
    addSaving.value = false
  }
}


</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 space-y-6">
    <!-- Header & KPIs -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
    <h1
      class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
    >
      <MonitorPlay :size="20" class="text-slate-700 dark:text-slate-200" />
      {{ $t('nav.demos') }}
    </h1>
    <p class="text-slate-500 text-sm mt-1">
      {{ $t('demos.subtitle') }}
    </p>

      <ButtonComponent
        variant="primary"
        :iconLeft="Plus"
        class="mt-3"
        @click="showAddModal = true"
      >
        {{ $t('demos.actions.add') }}
      </ButtonComponent>
    </div>
      <div class="flex gap-3">
        <div
          class="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
        >
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-widest"
          >
            {{ $t('demos.kpis.received') }}
          </p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">
            {{ allDemos.length }}
          </p>
        </div>
        <div
          class="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
        >
          <p
            class="text-[10px] uppercase font-bold text-blue-500 tracking-widest"
          >
            {{ $t('demos.kpis.new') }}
          </p>
          <p class="text-2xl font-black text-blue-600">
            {{ allDemos.filter((d) => d.status === "New").length }}
          </p>
        </div>
        <div
          class="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
        >
          <p
            class="text-[10px] uppercase font-bold text-emerald-500 tracking-widest"
          >
             {{ $t('demos.kpis.converted') }}
          </p>
          <p class="text-2xl font-black text-emerald-600">
            {{ allDemos.filter((d) => d.status === "Converted").length }}
          </p>
        </div>
      </div>
      
    </div>

    <!-- Filtres -->
    <div
      class="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
    >
      <div class="flex-1 relative">
        <Search
          :size="16"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          v-model="searchQuery"
          :placeholder="$t('demos.placeholders.search')"
          customClass="pl-10 w-full !bg-slate-50 dark:!bg-slate-950"
        />
      </div>
      <Select
        v-model="filterStatus"
        :options="[
          { label: t('demos.filters.allStatuses'), value: 'all' },
          ...Object.keys(statusConfig).map((k) => ({
            label: statusConfig[k as DemoStatus].label,
            value: k,
          })),
        ]"
        class="w-full sm:w-56 -translate-y-1.5"
      />
    </div>

    <!-- Table -->
    <div
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <BaseTable
        :columns="columns"
        :data="demos"
        :loading="loading"
        :meta="meta"
        @page-change="(p) => fetchDemos(p)"
        @limit-change="(l) => { limit = l; fetchDemos(1) }" 
      >
        <template #cell-contact="{ row }">
          <div class="flex flex-col min-w-[150px]">
            <span class="font-bold text-slate-900 dark:text-white truncate">{{
              row.contactName
            }}</span>
            <span class="text-xs text-slate-400 truncate">{{ row.email }}</span>
          </div>
        </template>

        <template #cell-company="{ row }">
          <div class="flex flex-col">
            <span
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >{{ row.companyName }}</span
            >
            <div
              class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5"
            >
              <span
                class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1"
              >
                <BedDouble :size="10" /> {{ row.numberOfRooms || 0 }}
              </span>
              <span v-if="row.country" class="truncate max-w-[100px]">{{
                row.country
              }}</span>
            </div>
          </div>
        </template>

        <template #cell-status="{ row }">
          <span
            :class="[
              'text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter',
              statusConfig[row.status as DemoStatus].classes,
            ]"
          >
            {{ statusConfig[row.status as DemoStatus].label }}
          </span>
        </template>

        <!-- ACTION LOGIQUE WORKFLOW -->
        <template #cell-next="{ row }">
          <button
            v-if="statusConfig[row.status as DemoStatus].nextStep"
            @click.stop="
              openModal(row, statusConfig[row.status as DemoStatus].nextStep)
            "
            class="group flex items-center gap-2 text-[11px] font-black text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-200 dark:shadow-none"
          >
            {{ statusConfig[row.status as DemoStatus].nextLabel }}
            <ChevronRight
              :size="14"
              class="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <span
            v-else-if="row.status === 'Converted'"
            class="text-[11px] text-emerald-600 font-bold flex items-center gap-1"
          >
            <CheckCircle :size="14" /> {{ $t('fileFinalized') }}
          </span>
          <span v-else class="text-[11px] text-slate-400 font-medium"
            >{{ $t('noAction') }}</span
          >
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <ButtonComponent
              variant="ghost"
              size="sm"
              :iconLeft="Eye"
              @click.stop="
                handleDetail(row)
              "
              :title="$t('demos.detail.title')"
            />
            <ButtonComponent
              variant="ghost"
              size="sm"
              :iconLeft="row.emailSend ? MailCheck : Mail"
              :aria-label="row.emailSend ? t('demos.actions.emailSent') : t('demos.actions.resendEmail')"
              :class="row.emailSend ? 'text-emerald-500' : ''"
              @click.stop="handleResendEmail(row.id)"
            />
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- ── MODALE  ── -->
    <BaseModal v-model="showWorkflowModal" customClass="max-w-lg">
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"
          >
            <ArrowRight :size="20" />
          </div>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white">
              {{ workflowConfig.title }}
            </h3>
            <p class="text-xs text-slate-400">
              {{ currentDemo?.contactName }} — {{ currentDemo?.companyName }}
            </p>
          </div>
        </div>
      </template>

      <div class="space-y-5 py-2">
        <!-- CHAMPS ÉTAPE : QUALIFY -->
        <div
          v-if="currentStep === 'qualify'"
          class="space-y-4 animate-in fade-in duration-300"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input v-model="workflowForm.contactName" :lb="$t('demos.fields.contactName')" />
            <Input v-model="workflowForm.companyName" :lb="$t('demos.fields.companyName')" />
            <Input v-model="workflowForm.email" :lb="$t('demos.fields.companyName')" type="email" />
            <Input v-model="workflowForm.phoneNumber" :lb="$t('demos.fields.phoneNumber')" />
            <Input v-model="workflowForm.country" :lb="$t('demos.fields.country')" />
            <Input
              v-model.number="workflowForm.numberOfRooms"
              type="number"
              :lb="$t('demos.fields.numberOfRooms')"
              :is-required="true"
            />
            <Input
              v-model="workflowForm.propertyType"
              :lb="$t('demos.fields.propertyType')"
              :placeholder="$t('demos.placeholders.propertyType')"
              class="col-span-2"
            />
          </div>
          <Select
            v-model="workflowForm.status"
            :lb="$t('common.status')"
            :options="[
              { label: statusConfig['Qualified'].label, value: 'Qualified' },
              { label: statusConfig['Lost'].label, value: 'Lost' },
            ]"
          />
          <div v-if="workflowForm.status === 'Lost'">
            <label
              class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 truncate"
              >{{ $t('demos.fields.reason') }}</label
            >
            <textarea
              v-model="workflowForm.notesMessage"
              rows="3"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-purple-400 outline-none"
              :placeholder="$t('demos.placeholders.reason')"
            ></textarea>
          </div>
        </div>

        <!-- CHAMPS ÉTAPE : SCHEDULE -->
        <div
          v-if="currentStep === 'schedule'"
          class="space-y-4 animate-in fade-in duration-300"
        >
          <Input
            v-model="workflowForm.followUpDate"
            type="datetime-local"
            :lb="$t('demos.fields.followUpDate')"
            isRequired
          />
         
          <Select
            v-model="workflowForm.ownerId"
            :options="users"
            :lb="$t('demos.fields.assignedTo')"
            :placeholder="$t('demos.placeholders.select')"
            isRequired
          />
        </div>

        <!-- CHAMPS ÉTAPE : COMPLETE OU LOST -->
        <div
          v-if="currentStep === 'complete' || currentStep === 'lost'"
          class="space-y-4 animate-in fade-in duration-300"
        >
          <div>
            <label
              class="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300"
            >
              {{
                currentStep === "lost"
                  ? $t('demos.fields.reason')
                  : $t('demos.fields.notes')
              }}
            </label>
            <textarea
              v-model="workflowForm.notesMessage"
              rows="4"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-purple-400 outline-none"
              :placeholder="
                currentStep === 'lost'
                  ? $t('demos.placeholders.reason')
                  : $t('demos.placeholders.notes')
              "
            ></textarea>
          </div>
          <Input
            v-if="currentStep === 'complete'"
            v-model="workflowForm.competition"
            :lb="$t('demos.fields.competition')"
            :placeholder="$t('demos.placeholders.competition')"
          />
        </div>

        <!-- CHAMPS ÉTAPE : CONVERT -->
        <div
          v-if="currentStep === 'convert' || currentStep === 'negotiate'"
          class="py-6 text-center animate-in zoom-in duration-300"
        >
          <div
            class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserCheck :size="40" />
          </div>
          <h4 class="text-lg font-black text-slate-900 dark:text-white">
            {{ $t('demos.text.final') }}
          </h4>
          <p class="text-sm text-slate-500 mt-2 sm:px-6">
           {{ $t('demos.text.converted') }}
            <strong>{{
              currentStep === "convert" ? $t('demos.status.converted') : $t('demos.status.negotiation')
            }}</strong
            >.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 w-full">
          <ButtonComponent
            variant="outline"
            class="flex-1"
            :disabled="saving"
            @click="showWorkflowModal = false"
            >{{ $t('common.cancel') }}</ButtonComponent
          >
          <ButtonComponent
            variant="primary"
            class="flex-[2]"
            :loading="saving"
            @click="handleSubmit"
          >
            {{ workflowConfig.btn }}
          </ButtonComponent>
        </div>
      </template>
    </BaseModal>

    <BaseModal v-model="showAddModal" customClass="max-w-lg">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
            <Plus :size="20" />
          </div>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white">
              {{ $t('demos.add.title') }}
            </h3>
            <p class="text-xs text-slate-400">{{ $t('demos.add.subtitle') }}</p>
          </div>
        </div>
      </template>

      <div class="space-y-4 py-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input v-model="addForm.contactName" :lb="$t('demos.fields.contactName')" :placeholder="$t('demos.placeholders.contactName')" isRequired />
          <Input v-model="addForm.companyName" :lb="$t('demos.fields.companyName')" :placeholder="$t('demos.placeholders.companyName')" isRequired />
          <Input v-model="addForm.email" :lb="$t('demos.fields.email')" type="email" placeholder="info@gmail.com" isRequired />
          <Input v-model="addForm.phoneNumber" :lb="$t('demos.fields.phoneNumber')" placeholder="698574123"/>
          <Input v-model="addForm.country" :lb="$t('demos.fields.country')" :placeholder="$t('demos.placeholders.country')" />
          <Input
            v-model.number="addForm.numberOfRooms"
            type="number"
            :lb="$t('demos.fields.numberOfRooms')"
            placeholder="Ex: 24"
          />
          <Input
            v-model="addForm.propertyType"
            :lb="$t('demos.fields.propertyType')"
            :placeholder="$t('demos.placeholders.propertyType')"
            class="col-span-2"
          />
          <!-- <Input v-model="addForm.leadSource" :lb="$t('demos.fields.leadSource')" class="col-span-2" /> -->
        </div>
        <!-- <div>
          <label class="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300">
            {{ $t('demos.fields.notes') }}
          </label>
          <textarea
            v-model="addForm.notesMessage"
            rows="3"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-purple-400 outline-none"
            :placeholder="$t('demos.placeholders.notes')"
          ></textarea>
        </div> -->
      </div>

      <template #footer>
        <div class="flex gap-3 w-full">
          <ButtonComponent
            variant="outline"
            class="flex-1"
            :disabled="addSaving"
            @click="showAddModal = false"
          >
            {{ $t('common.cancel') }}
          </ButtonComponent>
          <ButtonComponent
            variant="primary"
            class="flex-[2]"
            :loading="addSaving"
            @click="handleAddDemo"
          >
            {{ $t('demos.add.btn') }}
          </ButtonComponent>
        </div>
      </template>
    </BaseModal>
      
      </div>
    </template>

<style scoped>
.animate-in {
  animation-duration: 0.3s;
}
</style>

