import {
  asChildId,
  asDoseId,
  asISODate,
  asISOTimestamp,
  asVaccineId,
  asVisitId,
  type RecordExportInput,
} from '@/contracts';

import { buildHtml } from '../buildHtml';

const fixture: RecordExportInput = {
  child: {
    id: asChildId('child-1'),
    name: 'Adaobi Okeke',
    birthDate: asISODate('2026-03-01'),
    sex: 'female',
    photoUri: null,
    createdAt: asISOTimestamp('2026-03-01T10:00:00.000Z'),
    updatedAt: asISOTimestamp('2026-03-01T10:00:00.000Z'),
  },
  items: [
    {
      dose: {
        id: asDoseId('bcg'),
        vaccineId: asVaccineId('bcg'),
        vaccineName: 'Bacille Calmette–Guérin',
        shortName: 'BCG',
        doseLabel: 'Birth dose',
        offsetDays: 0,
        visitId: asVisitId('birth'),
        visitLabel: 'At birth',
        route: 'intradermal',
        protectsAgainst: ['Tuberculosis'],
      },
      dueDate: asISODate('2026-03-01'),
      status: 'given',
      daysUntilDue: -30,
      record: {
        childId: asChildId('child-1'),
        doseId: asDoseId('bcg'),
        status: 'given',
        givenDate: asISODate('2026-03-02'),
        note: 'PHC Ikeja',
        updatedAt: asISOTimestamp('2026-03-02T12:00:00.000Z'),
      },
    },
    {
      dose: {
        id: asDoseId('penta-1'),
        vaccineId: asVaccineId('penta'),
        vaccineName: 'Pentavalent vaccine',
        shortName: 'Penta',
        doseLabel: '1st dose',
        offsetDays: 42,
        visitId: asVisitId('week-6'),
        visitLabel: '6 weeks',
        route: 'injection',
        protectsAgainst: ['Diphtheria', 'Tetanus', 'Pertussis', 'Hepatitis B', 'Hib'],
      },
      dueDate: asISODate('2026-04-12'),
      status: 'overdue',
      daysUntilDue: -10,
      record: null,
    },
  ],
  summary: {
    totalDoses: 2,
    givenCount: 1,
    overdueCount: 1,
    dueCount: 0,
    completion: 0.5,
    nextVisit: null,
  },
  scheduleSource: 'NPHCDA Routine Immunization Schedule',
  generatedAt: new Date(2026, 3, 22, 14, 30),
};

describe('export/buildHtml', () => {
  it('renders a stable clinic record document', () => {
    expect(buildHtml(fixture)).toMatchSnapshot();
  });

  it('escapes HTML in user-provided fields', () => {
    const html = buildHtml({
      ...fixture,
      child: { ...fixture.child, name: 'Ada <script>alert(1)</script>' },
    });
    expect(html).toContain('Ada &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });
});
