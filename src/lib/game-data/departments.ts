import escortIcon from '@/assets/depts/ESCORT.png';
import infrastructureIcon from '@/assets/depts/INFRASTRUCTURE.png';
import postproductionIcon from '@/assets/depts/POSTPRODUCTION.png';
import preproductionIcon from '@/assets/depts/PREPRODUCTION.png';
import producersIcon from '@/assets/depts/PRODUCERS.png';
import productionIcon from '@/assets/depts/PRODUCTION.png';
import releaseIcon from '@/assets/depts/RELEASE.png';
import scriptIcon from '@/assets/depts/SCRIPT.png';
import securityIcon from '@/assets/depts/SECURITY.png';
import techIcon from '@/assets/depts/TECH.png';

export interface Department {
  id: string;
  name: string;
  icon: string;
}

const DEPARTMENT_LIST: Department[] = [
  { id: 'ESCORT', name: 'Services', icon: escortIcon },
  { id: 'INFRASTRUCTURE', name: 'Maintenance', icon: infrastructureIcon },
  { id: 'POSTPRODUCTION', name: 'Post-Production', icon: postproductionIcon },
  { id: 'PREPRODUCTION', name: 'Pre-Production', icon: preproductionIcon },
  { id: 'PRODUCERS', name: 'Producers Offices', icon: producersIcon },
  { id: 'PRODUCTION', name: 'Production', icon: productionIcon },
  { id: 'RELEASE', name: 'Distribution', icon: releaseIcon },
  { id: 'SCRIPT', name: 'Script Department', icon: scriptIcon },
  { id: 'SECURITY', name: 'Security', icon: securityIcon },
  { id: 'TECH', name: 'Engineering', icon: techIcon },
];

export class Departments {
  static readonly ALL = DEPARTMENT_LIST;

  static get(id: string): Department | undefined {
    return DEPARTMENT_LIST.find((d) => d.id === id);
  }

  static getIcon(id: string): string | undefined {
    return DEPARTMENT_LIST.find((d) => d.id === id)?.icon;
  }

  static getName(id: string): string | undefined {
    return DEPARTMENT_LIST.find((d) => d.id === id)?.name;
  }
}
