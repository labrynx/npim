import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Tipo para la configuración del proyecto
type ProjectConfig = {
  projectStructure: string[];
  packager: {
    type: string;
    config: {
      dependencies: string[];
      devDependencies: string[];
    };
  };
  git: {
    init: boolean;
    remote: string;
    url: string;
  };
  ci_cd: {
    provider: string;
    config: Record<string, unknown>;
  };
  database: {
    type: string;
    config: Record<string, unknown>;
  };
  testing: {
    framework: string;
    config: Record<string, unknown>;
  };
  documentation: {
    tool: string;
    config: Record<string, unknown>;
  };
  security: {
    features: string[];
  };
  deployment: {
    environments: string[];
    config: Record<string, unknown>;
  };
  i18n: {
    languages: string[];
  };
};

// Leer el archivo de configuración del proyecto
const config: ProjectConfig = JSON.parse(
  fs.readFileSync('project-config.json', 'utf-8'),
);

// 1. Crear la estructura del proyecto
config.projectStructure.forEach((dir) => {
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
});

// 2. Inicializar Git
if (config.git.init) {
  execSync('git init');
  execSync(`git remote add ${config.git.remote} ${config.git.url}`);
}

// 3. Configuración de CI/CD
if (config.ci_cd.provider === 'GitHub Actions') {
  const workflowDir = path.join('.github', 'workflows');
  fs.mkdirSync(workflowDir, { recursive: true });
  //  fs.writeFileSync(
  //    path.join(workflowDir, config.ci_cd.config.workflow_file), // <= TODO: Revisar cuando se definan las opciones de GitHub Actions
  //    '...',
  //  );
}

// 4. Configuración de la base de datos
const dbConfigFile = path.join('config', 'database.json');
fs.writeFileSync(dbConfigFile, JSON.stringify(config.database.config, null, 2));

// 5. Configuración del entorno de pruebas
if (config.testing.framework === 'Jest') {
  execSync('npm install --save-dev jest');
  const jestConfigFile = path.join('config', 'jest.config.js');
  fs.writeFileSync(jestConfigFile, '...');
}

// Packager Configuration
if (config.packager.type === 'npm') {
  const dependencies = config.packager.config.dependencies.join(' ');
  const devDependencies = config.packager.config.devDependencies.join(' ');

  if (dependencies) {
    execSync(`npm install ${dependencies}`);
  }

  if (devDependencies) {
    execSync(`npm install --save-dev ${devDependencies}`);
  }
} else if (config.packager.type === 'yarn') {
  // Yarn-specific logic
  // ...
}
