'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import SelectInput from '@/components/ui/SelectInput';
import { LessonPlan, SectionType } from '@/types/domain.types';

const SECTION_TYPE_OPTIONS = [
  { value: 'introduction', label: 'Introduction' },
  { value: 'activity',     label: 'Activity'     },
  { value: 'discussion',   label: 'Discussion'   },
  { value: 'assessment',   label: 'Assessment'   },
  { value: 'wrap_up',      label: 'Wrap Up'      },
];

const GRADE_LEVELS = [
  'Kindergarten',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

const GRADE_OPTIONS = GRADE_LEVELS.map(g => ({ value: g, label: g }));

interface SectionDraft {
  type: SectionType;
  title: string;
  content: string;
  sort_order: number;
}

interface Props {
  initial?: Partial<LessonPlan>;
  onSubmit: (data: any) => Promise<any>;
  onCancel: () => void;
  loading: boolean;
}

export default function LessonPlanForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [title,    setTitle]    = useState(initial?.title    ?? '');
  const [subject,  setSubject]  = useState(initial?.subject  ?? '');
  const [grade,    setGrade]    = useState(initial?.grade_level ?? '');
  const [desc,     setDesc]     = useState(initial?.description ?? '');
  const [duration, setDuration] = useState<number | ''>(initial?.duration_minutes ?? 60);
  const [sections, setSections] = useState<SectionDraft[]>(
    initial?.sections?.map(s => ({
      type:       s.type,
      title:      s.title ?? '',
      content:    s.content,
      sort_order: s.sort_order,
    })) ?? []
  );

  const addSection = () =>
    setSections(prev => [...prev, { type: 'introduction', title: '', content: '', sort_order: prev.length }]);

  const removeSection = (i: number) =>
    setSections(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, sort_order: idx })));

  const updateSection = (i: number, field: keyof SectionDraft, value: string | number) =>
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      subject,
      grade_level:       grade,
      description:       desc || undefined,
      duration_minutes:  duration || 60,
      sections:          sections.map(s => ({ ...s, title: s.title || undefined })),
    });
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Core fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Title *</label>
          <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Fractions" required />
        </div>
        <div>
          <label className={labelClass}>Subject *</label>
          <input className={inputClass} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" required />
        </div>
        <div>
          <label className={labelClass}>Grade Level *</label>
          <SelectInput
            value={grade}
            onChange={setGrade}
            options={GRADE_OPTIONS}
            placeholder="Select grade…"
          />
        </div>
        <div>
          <label className={labelClass}>Duration (minutes)</label>
          <input
            className={inputClass}
            type="number"
            min={5}
            max={480}
            value={duration}
            onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief overview of the lesson…" />
        </div>
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sections</h3>
          <Button type="button" size="sm" variant="ghost" onClick={addSection}>+ Add Section</Button>
        </div>

        {sections.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            No sections yet — click "+ Add Section" to start building your lesson.
          </p>
        )}

        <div className="space-y-3">
          {sections.map((section, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              {/* Section header row: number | type dropdown | title input | remove */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0 w-4 text-center">
                  {i + 1}
                </span>
                <SelectInput
                  value={section.type}
                  onChange={v => updateSection(i, 'type', v)}
                  options={SECTION_TYPE_OPTIONS}
                  className="w-36 shrink-0"
                />
                <input
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  value={section.title}
                  onChange={e => updateSection(i, 'title', e.target.value)}
                  placeholder="Section title (optional)"
                  maxLength={150}
                />
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <textarea
                className={inputClass}
                rows={4}
                placeholder="Write your section content here…"
                value={section.content}
                onChange={e => updateSection(i, 'content', e.target.value)}
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? 'Save Changes' : 'Create Lesson Plan'}</Button>
      </div>
    </form>
  );
}
