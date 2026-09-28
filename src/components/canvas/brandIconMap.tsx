import type { Skill } from '../../types'
import {
  TypeScriptIcon,
  ReactIcon,
  ThreeJSIcon,
  PythonIcon,
  DockerIcon,
  LinuxIcon,
  TailwindIcon,
  GitIcon,
  PostgreSQLIcon,
} from './BrandIcons'

/**
 * Returns the appropriate brand icon component for a skill.
 */
export function getBrandIcon(skill: Skill): React.JSX.Element {
  switch (skill.id) {
    case 'typescript':
      return <TypeScriptIcon />
    case 'react':
      return <ReactIcon />
    case 'three':
      return <ThreeJSIcon />
    case 'python':
      return <PythonIcon />
    case 'docker':
      return <DockerIcon />
    case 'linux':
      return <LinuxIcon />
    case 'tailwind':
      return <TailwindIcon />
    case 'git':
      return <GitIcon />
    case 'postgresql':
      return <PostgreSQLIcon />
    default:
      return <span className="font-mono text-sm">{skill.legend}</span>
  }
}