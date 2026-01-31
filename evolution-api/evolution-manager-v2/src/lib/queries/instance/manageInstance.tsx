import { NewInstance, Settings } from "@/types/evolution.types";

import { flowcoreApi } from "@/service/flowcore"; // Ensure path is correct alias
import { api, apiGlobal } from "../api";
import { useManageMutation } from "../mutateQuery";

const createInstance = async (instance: NewInstance) => {
  // Use Flowcore Service for Creation (Unified Endpoint)
  // Maps NewInstance to { instanceName, number? } expected by Flowcore Service
  const response = await flowcoreApi.post("/api/whatsapp/connect", {
    instanceName: instance.instanceName,
    number: instance.number,
    // flowcore service handles integration type & qrcode logic internally
  });
  return response.data;
};

const restart = async (instanceName: string) => {
  const response = await api.post(`/instance/restart/${instanceName}`);
  return response.data;
};

const logout = async (instanceName: string) => {
  // Use Flowcore Service for Logout (Uses Global Key Proxy)
  const response = await flowcoreApi.post(`/api/whatsapp/logout`, { instanceName });
  return response.data;
};

const deleteInstance = async (instanceName: string) => {
  // Use Flowcore Service for Delete (Uses Global Key Proxy)
  const response = await flowcoreApi.delete(`/api/whatsapp/delete/${instanceName}`);
  return response.data;
};

interface ConnectParams {
  instanceName: string;
  token: string;
  number?: string;
}
const connect = async ({ instanceName, token, number }: ConnectParams) => {
  // Use Flowcore Service for Connection (Unified Endpoint)
  const responsePost = await flowcoreApi.post("/api/whatsapp/connect", {
    instanceName,
    number
  });

  return responsePost.data;
};

interface UpdateSettingsParams {
  instanceName: string;
  token: string;
  data: Settings;
}
const updateSettings = async ({ instanceName, token, data }: UpdateSettingsParams) => {
  const response = await api.post(`/settings/set/${instanceName}`, data, {
    headers: {
      apikey: token,
    },
  });
  return response.data;
};

export function useManageInstance() {
  const connectMutation = useManageMutation(connect, {
    invalidateKeys: [
      ["instance", "fetchInstance"],
      ["instance", "fetchInstances"],
    ],
  });
  const updateSettingsMutation = useManageMutation(updateSettings, {
    invalidateKeys: [["instance", "fetchSettings"]],
  });
  const deleteInstanceMutation = useManageMutation(deleteInstance, {
    invalidateKeys: [
      ["instance", "fetchInstance"],
      ["instance", "fetchInstances"],
    ],
  });
  const logoutMutation = useManageMutation(logout, {
    invalidateKeys: [
      ["instance", "fetchInstance"],
      ["instance", "fetchInstances"],
    ],
  });
  const restartMutation = useManageMutation(restart, {
    invalidateKeys: [
      ["instance", "fetchInstance"],
      ["instance", "fetchInstances"],
    ],
  });
  const createInstanceMutation = useManageMutation(createInstance, {
    invalidateKeys: [["instance", "fetchInstances"]],
  });

  return {
    connect: connectMutation,
    updateSettings: updateSettingsMutation,
    deleteInstance: deleteInstanceMutation,
    logout: logoutMutation,
    restart: restartMutation,
    createInstance: createInstanceMutation,
  };
}
