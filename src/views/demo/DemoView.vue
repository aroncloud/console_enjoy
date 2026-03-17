<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from "vue";
import { useI18n } from 'vue-i18n'
import {
  MonitorPlay,
  Search,
  Clock,
  CheckCircle,
  Calendar,
  Mail,
  MailCheck,
  Eye,
  Building2,
  Phone,
  Globe,
  BedDouble,
  Edit,
  ArrowRight,
  XCircle,
  Trash2,
  UserCheck,
  ChevronRight,
} from "lucide-vue-next";

import Input from "../../components/FormElements/Input.vue";
import ButtonComponent from "../../components/Button/ButtonComponent.vue";
import BaseTable from "../../components/Table/BaseTable.vue";
import type { Column } from "../../components/Table/BaseTable.vue";
import BaseModal from "../../components/Modal/BaseModal.vue";
import Select from "../../components/FormElements/Select.vue";
import Toggle from "../../components/FormElements/Toggle.vue";
import { useToastStore } from "../../composables/toast";
import { demoService } from "../../servicesAPI/demoService";
import type {
  Demo,
  DemoStatus,
  UpdateDemoPayload,
} from "../../servicesAPI/demoService";
import { userService } from "../../servicesAPI/userService";
import { hotelService } from "../../servicesAPI/clientService";
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
const { t, locale } = useI18n()
const page = ref(1);
const limit = ref(20);
const meta = ref<any>(null);
const users = ref<any[]>([]);

// --- ÉTATS DES MODALES ---
const showWorkflowModal = ref(false);
const showDetailModal = ref(false);
const showEditModal = ref(false);
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

const statusConfig: Record<
  DemoStatus,
  { label: string; classes: string; nextLabel?: string; nextStep?: StepType }
> = {
  New: {
    label: "Nouveau",
    classes: "bg-blue-100 text-blue-800",
    nextLabel: "Contacter",
    nextStep: "qualify",
  },
  Qualified: {
    label: "Qualifié",
    classes: "bg-purple-100 text-purple-800",
    nextLabel: "Planifier Démo",
    nextStep: "schedule",
  },
  "Demo Scheduled": {
    label: "Démo planifiée",
    classes: "bg-amber-100 text-amber-800",
    nextLabel: "Terminer Démo",
    nextStep: "complete",
  },
  "Demo Completed": {
    label: "Démo effectuée",
    classes: "bg-cyan-100 text-cyan-800",
    nextLabel: "Passer en Négoc.",
    nextStep: "negotiate",
  },
  Trial: {
    label: "En essai",
    classes: "bg-indigo-100 text-indigo-800",
    nextLabel: "Convertir",
    nextStep: "convert",
  },
  Negotiation: {
    label: "Négociation",
    classes: "bg-orange-100 text-orange-800",
    nextLabel: "Convertir",
    nextStep: "convert",
  },
  Converted: { label: "Converti ", classes: "bg-emerald-100 text-emerald-800" },
  Lost: { label: "Perdu ", classes: "bg-rose-100 text-rose-800" },
  Junk: { label: "Indésirable", classes: "bg-slate-100 text-slate-500" },
};

const workflowConfig = computed(() => {
  const map = {
    qualify: {
      title: "Étape 2 : Qualification",
      btn: "Confirmer la Qualification",
      color: "primary",
    },
    schedule: {
      title: "Étape 3 : Planification",
      btn: "Programmer le RDV",
      color: "primary",
    },
    complete: {
      title: "Étape 4 : Compte-rendu",
      btn: "Clôturer la Démo",
      color: "primary",
    },
    negotiate: {
      title: "Étape 6 : Négociation",
      btn: "Lancer la Négociation",
      color: "primary",
    },
    convert: {
      title: "Étape 7 : Conversion",
      btn: "Finaliser la Vente",
      color: "success",
    },
    lost: {
      title: "Marquer comme Perdu",
      btn: "Confirmer la Perte",
      color: "danger",
    },
  };
  return currentStep.value ? map[currentStep.value] : map.qualify;
});

const columns: Column[] = [
  { key: "contact", label: "Contact" },
  { key: "company", label: "Société / Chambres" },
  { key: "status", label: "Statut Actuel" },
  { key: "next", label: "Action Suivante" },
  { key: "actions", label: "Actions", sortable: false },
];

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
    console.log("res", res);
    demos.value = res.data;
    meta.value = {
      total: res.meta.total,
      page: res.meta.currentPage,
      limit: res.meta.perPage,
      totalPages: res.meta.lastPage,
    };
  } catch (e) {
    toastStore.show({
      type: "error",
      message: "Erreur chargement des demandes",
    });
  } finally {
    loading.value = false;
  }
};

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
    const res = await userService.getAll({ page: 1, limit: 1000 });
    console.log("res", res);
    users.value = res.data.map((u: any) => ({
      label:
        u.fullname ||
        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
        u.email ||
        "Sans nom",
      value: u.id,
    }));
  } catch (e) {
    console.error(e);
    toastStore.show({
      type: "error",
      message: "Erreur lors du chargement des utilisateurs",
    });
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

const formatDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// --- GESTION DU WORKFLOW ---
const openModal = (demo: Demo, step: StepType) => {
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
  if (!currentDemo.value || !currentStep.value) return;
  saving.value = true;
  let payload: Partial<UpdateDemoPayload> = {};

  try {
    if (currentStep.value === "qualify") {
      payload = {
        status: workflowForm.status === "Lost" ? "Lost" : "Qualified",
        contactName: workflowForm.contactName,
        companyName: workflowForm.companyName,
        email: workflowForm.email,
        phoneNumber: workflowForm.phoneNumber,
        country: workflowForm.country,
        numberOfRooms: workflowForm.numberOfRooms,
        propertyType: workflowForm.propertyType,
        ...(workflowForm.status === "Lost" && workflowForm.notesMessage
          ? { notesMessage: `RAISON PERTE: ${workflowForm.notesMessage}` }
          : {}),
      };
    } else if (currentStep.value === "schedule") {
      if (!workflowForm.followUpDate)
        throw new Error("La date du rendez-vous est requise");
      if (!workflowForm.ownerId)
        throw new Error("Veuillez sélectionner un commercial");
      payload = {
        status: "Demo Scheduled",
        followUpDate: workflowForm.followUpDate,
        ownerId: workflowForm.ownerId,
      };
    } else if (currentStep.value === "complete") {
      if (!workflowForm.notesMessage)
        throw new Error("Veuillez saisir les retours de la démo");
      payload = {
        status: "Demo Completed",
        notesMessage: workflowForm.notesMessage,
        competition: workflowForm.competition,
      };
    } else if (currentStep.value === "negotiate") {
      payload = { status: "Negotiation" };
    } else if (currentStep.value === "convert") {
      showWorkflowModal.value = false;
      router.push({
        path: "/clients",
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
      });
      return;
    } else if (currentStep.value === "lost") {
      if (!workflowForm.notesMessage)
        throw new Error("Veuillez indiquer la raison de la perte");
      payload = {
        status: "Lost",
        notesMessage: `RAISON PERTE: ${workflowForm.notesMessage}`,
      };
    }

    await demoService.update(currentDemo.value.id, payload);
    toastStore.show({
      message: "Étape mise à jour avec succès",
      type: "success",
    });
    showWorkflowModal.value = false;
    fetchDemos(page.value);
    fetchAllDemos();
  } catch (e: any) {
    toastStore.show({
      message: e.message || "Erreur de mise à jour",
      type: "error",
    });
  } finally {
    saving.value = false;
  }
};

const handleGeneralUpdate = async () => {
  if (!currentDemo.value) return;
  saving.value = true;
  try {
    await demoService.update(currentDemo.value.id, workflowForm);
    toastStore.show({ message: "Modifications enregistrées", type: "success" });
    showEditModal.value = false;
    fetchDemos(page.value);
  } catch (e) {
    toastStore.show({
      message: "Erreur lors de la mise à jour",
      type: "error",
    });
  } finally {
    saving.value = false;
  }
};

const handleResendEmail = async (id: number) => {
  try {
    await demoService.resendEmail(id);
    toastStore.show({ message: "Email renvoyé", type: "success" });
    fetchDemos(page.value);
  } catch (e) {
    toastStore.show({
      message: "Erreur lors de l'envoi de l'email",
      type: "error",
    });
  }
};
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
          Démo
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Transformez vos prospects en clients PMS étape par étape.
        </p>
      </div>
      <div class="flex gap-3">
        <div
          class="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
        >
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-widest"
          >
            Total
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
            Nouveaux
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
            Convertis
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
          placeholder="Rechercher nom, email ou société..."
          customClass="pl-10 w-full !bg-slate-50 dark:!bg-slate-950"
        />
      </div>
      <Select
        v-model="filterStatus"
        :options="[
          { label: 'Tous les statuts', value: 'all' },
          ...Object.keys(statusConfig).map((k) => ({
            label: statusConfig[k as DemoStatus].label,
            value: k,
          })),
        ]"
        class="w-full sm:w-56"
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
            <CheckCircle :size="14" /> Dossier Finalisé
          </span>
          <span v-else class="text-[11px] text-slate-400 font-medium"
            >Aucune action</span
          >
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <ButtonComponent
              variant="ghost"
              size="sm"
              :iconLeft="Eye"
              @click.stop="
                currentDemo = row;
                showDetailModal = true;
              "
              title="Détails"
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

    <!-- ── MODALE UNIQUE DE WORKFLOW (DYNAMIQUE) ── -->
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
          <div class="grid grid-cols-2 gap-4">
            <Input v-model="workflowForm.contactName" lb="Nom du contact" />
            <Input v-model="workflowForm.companyName" lb="Société" />
            <Input v-model="workflowForm.email" lb="Email" type="email" />
            <Input v-model="workflowForm.phoneNumber" lb="Téléphone" />
            <Input v-model="workflowForm.country" lb="Pays" />
            <Input
              v-model.number="workflowForm.numberOfRooms"
              type="number"
              lb="Nombre de chambres"
              placeholder="Ex: 24"
            />
            <Input
              v-model="workflowForm.propertyType"
              lb="Type de propriété"
              placeholder="Hôtel, Resort, Villa..."
              class="col-span-2"
            />
          </div>
          <Select
            v-model="workflowForm.status"
            lb="Statut"
            :options="[
              { label: statusConfig['Qualified'].label, value: 'Qualified' },
              { label: statusConfig['Lost'].label, value: 'Lost' },
            ]"
          />
          <div v-if="workflowForm.status === 'Lost'">
            <label
              class="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300"
              >Raison de la perte</label
            >
            <textarea
              v-model="workflowForm.notesMessage"
              rows="3"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-rose-400 outline-none"
              placeholder="Pourquoi le prospect a refusé ?"
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
            lb="Date et heure du rendez-vous"
            isRequired
          />
          <!-- CORRECTION : utilisation de users pour les options, avec le bon format -->
          <Select
            v-model="workflowForm.ownerId"
            :options="users"
            lb="Commercial responsable"
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
                  ? "Raison de la perte"
                  : "Notes & retours de la démo"
              }}
            </label>
            <textarea
              v-model="workflowForm.notesMessage"
              rows="4"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-purple-400 outline-none"
              :placeholder="
                currentStep === 'lost'
                  ? 'Pourquoi le prospect a refusé ? (Prix, Manque de fonctions...)'
                  : 'Points de douleur, modules préférés...'
              "
            ></textarea>
          </div>
          <Input
            v-if="currentStep === 'complete'"
            v-model="workflowForm.competition"
            lb="Concurrent mentionné ?"
            placeholder="Opera, Mews, D-edge..."
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
            Passage à l'étape finale
          </h4>
          <p class="text-sm text-slate-500 mt-2 px-6">
            Le contrat est-il prêt ? Cette action changera le statut du prospect
            en
            <strong>{{
              currentStep === "convert" ? "Converti" : "Négociation"
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
            >Annuler</ButtonComponent
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

    <!-- ── MODALE DÉTAIL ── -->
    <BaseModal v-model="showDetailModal">
      <div v-if="currentDemo" class="space-y-6">
        <div
          class="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4"
        >
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ currentDemo.contactName }}
            </h2>
            <p class="text-slate-500 font-medium">
              {{ currentDemo.companyName }}
            </p>
          </div>
          <span
            :class="[
              'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
              statusConfig[currentDemo.status].classes,
            ]"
          >
            {{ statusConfig[currentDemo.status].label }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-sm">
              <Mail :size="16" class="text-slate-400" />
              <span>{{ currentDemo.email }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Phone :size="16" class="text-slate-400" />
              <span>{{ currentDemo.phoneNumber || "—" }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Globe :size="16" class="text-slate-400" />
              <span>{{ currentDemo.country || "—" }}</span>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-sm">
              <BedDouble :size="16" class="text-slate-400" />
              <span>{{ currentDemo.numberOfRooms }} chambres</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Building2 :size="16" class="text-slate-400" />
              <span>{{ currentDemo.propertyType || "Type non spécifié" }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Calendar :size="16" class="text-slate-400" />
              <span>Reçu le {{ formatDate(currentDemo.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="currentDemo.notesMessage"
          class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700"
        >
          <h5
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2"
          >
            Historique / Notes
          </h5>
          <p
            class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed"
          >
            {{ currentDemo.notesMessage }}
          </p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.3s;
}
</style>

