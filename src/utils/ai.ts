import type { AiGlobalConfig } from "../../lib";

type ModelKeys = keyof AiGlobalConfig['models'];

export interface IModel {
  id: string;
  nameKey: ModelKeys;
  name: string;
  customUrl?: string;
  model?: string;
  apiKey?: string;
  appId?: string;
  apiSecret?: string;
  version?: string;
}

export type IModelList = Partial<IModel>[];

export interface IModelSettings {
  customModels: IModelList;
  currentModelId: string;
  useCustomModel: boolean;
}

export const presetModels: IModelList = [
  {
    id: 'glm-4-flash',
    nameKey: 'openai' as ModelKeys,
    name: '智谱大模型 | GLM-4-Flash',
    customUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model: "glm-4-flash",
    apiKey: "f47f3425851548d58a1c719145c47430.jSKg42xEv8htrat0",
  },
  {
    id: 'spark-flash',
    nameKey: 'spark' as ModelKeys,
    name: '星火大模型 - flash',
    appId: 'da91cc32',
    apiKey: '6e9e24c23de93c63ab09ea40481ea981',
    apiSecret: 'MTY1YzBmMDViNjZjYmJmNGY5M2ViZTBi',
    version: 'v1.1',
  },
]

export const getPresetModel = (id: string): Partial<IModel> | undefined => {
  return presetModels.find((model) => model.id === id)
}
export const getModelSettings = (): IModelSettings => {
  const modelSettingStr = localStorage.getItem('palmdocs.modelSettings')
  if (modelSettingStr) {
    try {
      return JSON.parse(modelSettingStr)
    } catch (e) {
      console.error(e)
    }
  }
  return {
    customModels: [],
    currentModelId: presetModels[0].id!,
    useCustomModel: false,
  }
}

export const getCurrentModel = (): Partial<IModel> => {
  const modelSettings = getModelSettings();
  const { useCustomModel, currentModelId } = modelSettings;
  const defaultModel = presetModels[0]
  if (useCustomModel) {
    return modelSettings.customModels.find((model) => model.id === currentModelId) || defaultModel
  }
  return getPresetModel(currentModelId) || defaultModel
}