import { initCodelf } from './initCodelf.ts'
import { getProjectInfo } from './getProjectInfo.ts'
import { updateProjectInfo } from './updateProjectInfo.ts'

export const initTools = (server: any) => {
    initCodelf(server)
    getProjectInfo(server)
    updateProjectInfo(server)
}