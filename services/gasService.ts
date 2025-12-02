import { BackendData, Project, Log } from '../types';

// Mock data for local development
const DEMO_PROJECTS: Project[] = [{
  id: 'DEMO-01', name: '新官方網站改版', client: 'ABC 科技', budgetHours: 200, status: 'Active',
  startDate: new Date().toISOString().split('T')[0], endDate: null,
  wbs: [{id:1, name:'需求分析', collapsed:false}, {id:2, name:'視覺設計', collapsed:false}, {id:3, name:'前端開發', collapsed:false}],
  engineers: [{id:'e1', name:'Alex', color:'#10b981'}, {id:'e2', name:'Bob', color:'#3b82f6'}],
  tasks: [], holidays: []
}];

const DEMO_LOGS: Log[] = [
  { logId: Date.now(), date: new Date().toISOString().split('T')[0], engineer: 'Alex', projectId: 'DEMO-01', hours: 4, taskId: '', note: '首頁切版' }
];

export const GasService = {
  loadData: (): Promise<{ projects: Project[], logs: Log[], adminPassword: string }> => {
    return new Promise((resolve, reject) => {
      // Check if running in GAS environment
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.script) {
        (window as any).google.script.run
          .withSuccessHandler((data: BackendData) => {
            try {
              resolve({
                projects: JSON.parse(data.projects || '[]'),
                logs: JSON.parse(data.logs || '[]'),
                adminPassword: String(data.adminPassword || '8888')
              });
            } catch (e) {
              console.error("Parse error", e);
              reject("Data parse error");
            }
          })
          .withFailureHandler((err: any) => {
            reject(err);
          })
          .getData();
      } else {
        // Local fallback
        console.warn('Running in local mode');
        setTimeout(() => {
          const storedP = localStorage.getItem('pm_projects');
          const storedL = localStorage.getItem('pm_logs');
          resolve({
            projects: storedP ? JSON.parse(storedP) : DEMO_PROJECTS,
            logs: storedL ? JSON.parse(storedL) : DEMO_LOGS,
            adminPassword: '8888'
          });
        }, 800);
      }
    });
  },

  saveData: (projects: Project[], logs: Log[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.script) {
        const payload = {
          projects: JSON.stringify(projects),
          logs: JSON.stringify(logs)
        };
        (window as any).google.script.run
          .withSuccessHandler(() => resolve())
          .withFailureHandler((err: any) => reject(err))
          .saveData(payload);
      } else {
        localStorage.setItem('pm_projects', JSON.stringify(projects));
        localStorage.setItem('pm_logs', JSON.stringify(logs));
        resolve();
      }
    });
  }
};