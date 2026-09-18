import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // Legacy large files — exempt until split is complete (see AGENTS.md Architecture constraints).
    // New files must stay ≤200 lines; remove entries here as they are refactored.
    files: [
      'src/data/mock.ts',
      'src/lib/services.ts',
      'src/pages/teacher/Schedule.tsx',
      'src/pages/admin/Schedule.tsx',
      'src/pages/teacher/Attendance.tsx',
      'src/components/curriculum/CurriculumManager.tsx',
      'src/pages/admin/Resources.tsx',
      'src/pages/admin/Transactions.tsx',
      'src/pages/teacher/Grading.tsx',
      'src/pages/shared/Messages.tsx',
      'src/App.tsx',
      'src/components/ui/Calendar.tsx',
      'src/pages/admin/Certificates.tsx',
      'src/pages/admin/LiveClass.tsx',
      'src/pages/admin/Organisation.tsx',
      'src/pages/admin/People.tsx',
      'src/pages/auth/Register.tsx',
      'src/pages/student/Dashboard.tsx',
      'src/pages/student/Profile.tsx',
      'src/pages/teacher/Dashboard.tsx',
      'src/pages/teacher/People.tsx',
      'src/pages/student/CourseContents.tsx',
      'src/pages/teacher/Reports.tsx',
    ],
    rules: {
      'max-lines': 'off',
    },
  },
])
