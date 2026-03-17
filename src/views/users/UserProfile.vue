<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  Mail,
  Shield,
  Clock,
  Activity,
} from "lucide-vue-next";
import { userService, type User } from "../../servicesAPI/userService";
import ButtonComponent from "../../components/Button/ButtonComponent.vue";

const route = useRoute();
const router = useRouter();

const user = ref<any | null>(null);
const loading = ref(false);

const displayName = (u: User) => u.fullName || u.username || u.email || "—";
const displayRole = (u: User) =>
  u.role?.roleName || (u.roleId ? `Rôle #${u.roleId}` : "—");

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "U";

onMounted(async () => {
  loading.value = true;
  try {
    user.value = await userService.getById(Number(route.params.id));
  } catch (e: any) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const actionHistory = computed(() => user.value?.activityLogs ?? []);

const actionConfig: Record<string, { label: string; color: string }> = {
  LOGIN:                     { label: "Connexion",                     color: "emerald" },
  LOGOUT:                    { label: "Déconnexion",                   color: "slate"   },
  PASSWORD_RESET:            { label: "Mot de passe réinitialisé",     color: "amber"   },
  FORGOT_PASSWORD_REQUEST:   { label: "Demande de réinitialisation",   color: "orange"  },
  EMAIL_VERIFIED:            { label: "Email vérifié",                 color: "blue"    },
  RESEND_VERIFICATION_EMAIL: { label: "Email de vérification renvoyé", color: "purple"  },
};

const getActionLabel = (action: string) =>
  actionConfig[action]?.label ?? action;

const getActionDotColor = (action: string) => {
  const color = actionConfig[action]?.color ?? "slate";
  const map: Record<string, string> = {
    emerald: "bg-emerald-400 dark:bg-emerald-500",
    slate:   "bg-slate-400 dark:bg-slate-500",
    amber:   "bg-amber-400 dark:bg-amber-500",
    orange:  "bg-orange-400 dark:bg-orange-500",
    blue:    "bg-blue-400 dark:bg-blue-500",
    purple:  "bg-purple-400 dark:bg-purple-500",
  };
  return map[color] ?? map.slate;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const historyPage = ref(1);
const historyPageSize = 5;
const totalHistory = computed(() => actionHistory.value.length);
const paginatedHistory = computed(() => {
  const start = (historyPage.value - 1) * historyPageSize;
  return actionHistory.value.slice(start, start + historyPageSize);
});
const totalPages = computed(() =>
  Math.ceil(totalHistory.value / historyPageSize)
);
</script>

<template>
  <div class="p-4 md:p-8 space-y-6  bg-slate-50 dark:bg-slate-950">
    <!-- Back -->
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
    >
      <ArrowLeft class="w-4 h-4" /> Retour
    </button>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-6">
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 animate-pulse"
      >
        <div class="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div class="flex-1 space-y-3">
          <div class="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div class="flex gap-2">
            <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div class="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div class="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
        <div class="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
        >
          <div class="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          <div v-for="i in 5" :key="i" class="space-y-1.5">
            <div class="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div class="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
          >
            <div class="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div v-for="i in 4" :key="i" class="flex gap-4 pb-4">
              <div class="flex flex-col items-center">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div v-if="i < 4" class="w-px h-8 bg-slate-200 dark:bg-slate-700 mt-1" />
              </div>
              <div class="flex-1 space-y-1.5">
                <div class="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu -->
    <template v-else-if="user">
      <!-- Header Card -->
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0"
        >
          <span class="text-xl font-bold text-purple-700 dark:text-purple-200">
            {{ initials(displayName(user)) }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
            {{ displayName(user) }}
          </h1>
          <p class="text-sm text-slate-400 dark:text-slate-400 mt-0.5">
            @{{ user.username ?? "—" }}
          </p>
          <div class="flex flex-wrap gap-2 mt-3">
            <span
              class="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Mail class="w-3 h-3" /> {{ user.email }}
            </span>
            <span
              class="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300"
            >
              <Shield class="w-3 h-3" /> {{ displayRole(user) }}
            </span>
            <span
              :class="[
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                user.isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
              ]"
            >
              <span
                :class="['w-1.5 h-1.5 rounded-full', user.isActive ? 'bg-emerald-500' : 'bg-slate-400']"
              />
              {{ user.isActive ? "Actif" : "Inactif" }}
            </span>
          </div>
        </div>
        <!-- <ButtonComponent
          variant="secondary"
          @click="router.push({ name: 'users', query: { edit: user.id } })"
        >
          Modifier
        </ButtonComponent> -->
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Infos détaillées -->
        <div class="lg:col-span-1 space-y-6">
          <div
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
          >
            <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Informations
            </h2>
            <div class="space-y-3 grid grid-cols-2">
              <div>
                <p class="text-xs text-slate-400">Prénom</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ user.firstName ?? "—" }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Nom</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ user.lastName ?? "—" }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Email</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ user.email }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Téléphone</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ user.phoneNumber ?? "—" }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Rôle</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ displayRole(user) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Statut</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 capitalize">
                  {{ user.status ?? "—" }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Email vérifié</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ user.emailVerified ? "Oui" : "Non" }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Dernière connexion</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ user.lastLogin ? formatDate(user.lastLogin) : "—" }}
                </p>
              </div>
              <!-- <div>
                <p class="text-xs text-slate-400">Créé le</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {{ user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—" }}
                </p>
              </div> -->
            </div>
          </div>
        </div>

        <!-- Historique -->
        <div class="lg:col-span-2">
          <div
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
          >
            <div class="flex items-center gap-2 mb-4">
              <Activity class="w-4 h-4 text-slate-400" />
              <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                Historique des actions
              </h2>
              <span
                class="ml-auto text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full"
              >
                {{ totalHistory }}
              </span>
            </div>

            <div v-if="totalHistory === 0" class="text-sm text-slate-400 text-center py-6">
              Aucune activité enregistrée
            </div>

            <div v-else>
              <!-- Liste -->
              <div class="relative">
                <div
                  v-for="(item, index) in paginatedHistory"
                  :key="item.id"
                  class="flex gap-4 pb-4"
                >
                  <div class="flex flex-col items-center">
                    <div
                      :class="['w-2.5 h-2.5 rounded-full shrink-0 mt-1', getActionDotColor(item.action)]"
                    />
                    <div
                      v-if="index < paginatedHistory.length - 1"
                      class="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1"
                    />
                  </div>
                  <div class="flex-1 pb-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ getActionLabel(item.action) }}
                    </p>
                    <p class="text-xs text-slate-400 truncate mt-0.5">
                      {{ item.description }}
                    </p>
                    <div class="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                      <Clock class="w-3 h-3" /> {{ formatDate(item.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div
                v-if="totalPages > 1"
                class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2"
              >
                <span class="text-xs text-slate-400">
                  Page {{ historyPage }} / {{ totalPages }}
                </span>
                <div class="flex items-center gap-1">
                  <button
                    @click="historyPage--"
                    :disabled="historyPage === 1"
                    class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Précédent
                  </button>
                  <button
                    @click="historyPage++"
                    :disabled="historyPage === totalPages"
                    class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>