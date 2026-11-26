import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import WordModal from './WordModal';
import BatchImportModal from './BatchImportModal';

let host, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  localStorage.clear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

const setValue = (field, value) => act(() => Simulate.change(field, { target: { value } }));
const button = text => [...host.querySelectorAll('button')].find(element => element.textContent === text);

test('fills and saves a reviewed single card without an external lookup', async () => {
  const save = jest.fn();
  act(() => root.render(<WordModal isOpen onClose={() => {}} onSave={save}/>));
  setValue(host.querySelector('input'), 'abandon');
  await act(async () => { Simulate.click(button('Tra cứu và điền gợi ý')); });
  act(() => Simulate.submit(host.querySelector('form')));
  expect(save.mock.calls[0][0]).toMatchObject({ word: 'abandon', partOfSpeech: 'verb' });
  expect(save.mock.calls[0][0].exampleTranslation).toMatch(/công ty/i);
});

test('keeps incomplete batch entries editable and imports reviewed entries together', () => {
  const save = jest.fn();
  act(() => root.render(<BatchImportModal isOpen onClose={() => {}} onBatchSave={save} existingWords={[{ word: 'existing' }]}/>));
  const paste = host.querySelector('textarea');
  setValue(paste, 'existing\nabandon');
  expect(button('Lưu vào sổ').disabled).toBe(true);
  setValue(paste, 'abandon\nnew-word | từ mới | One new word. | Một từ mới.');
  expect(button('Lưu và học ngay').disabled).toBe(false);
  act(() => Simulate.click(button('Lưu và học ngay')));
  expect(save.mock.calls[0][0]).toHaveLength(2);
  expect(save.mock.calls[0][1]).toBe('study');
});


test('offers alternate senses and saves the chosen addition with the original', () => {
  const save = jest.fn();
  act(() => root.render(<BatchImportModal isOpen onClose={() => {}} onBatchSave={save}/>));
  setValue(host.querySelector('textarea'), 'produce: tạo ra');
  const alternative = [...host.querySelectorAll('.entry-review li')].find(li => li.textContent.includes('nông sản'));
  const add = [...alternative.querySelectorAll('button')].find(el => el.textContent === 'Thêm nghĩa');
  act(() => Simulate.click(add));
  act(() => Simulate.click(button('Lưu vào sổ')));
  expect(save.mock.calls[0][0][0].meaning).toBe('tạo ra; nông sản, rau củ quả');
});

test('asks the learner to resolve or confirm a meaning mismatch before saving', () => {
  const save = jest.fn();
  act(() => root.render(<BatchImportModal isOpen onClose={() => {}} onBatchSave={save}/>));
  setValue(host.querySelector('textarea'), 'practical: mặt trời');
  expect(button('Lưu vào sổ').disabled).toBe(true);
  act(() => Simulate.click(button('Dùng nghĩa này')));
  expect(button('Lưu vào sổ').disabled).toBe(false);
  act(() => Simulate.click(button('Lưu vào sổ')));
  expect(save.mock.calls[0][0][0].meaning).toBe('thiết thực, thực tế');
});

test('automatically looks up a pasted English-only word', async () => {
  const previous = global.fetch;
  jest.useFakeTimers();
  global.fetch = jest.fn(async url => ({
    ok: true,
    json: async () => url.includes('dictionaryapi')
      ? [{ phonetic: '/ˈmɑːrʃmæloʊ/', meanings: [{ partOfSpeech: 'noun', definitions: [{ example: 'She toasted a marshmallow over the fire.' }] }] }]
      : [[[url.includes('dt=bd') ? 'kẹo dẻo' : 'Cô ấy nướng một viên kẹo dẻo trên lửa.']]]
  }));
  try {
    const save = jest.fn();
    act(() => root.render(<BatchImportModal isOpen onClose={() => {}} onBatchSave={save}/>));
    setValue(host.querySelector('textarea'), 'marshmallow');
    await act(async () => { jest.advanceTimersByTime(900); });
    expect(button('Lưu vào sổ').disabled).toBe(false);
    act(() => Simulate.click(button('Lưu vào sổ')));
    expect(save.mock.calls[0][0][0]).toMatchObject({
      meaning: 'kẹo dẻo', example: 'She toasted a marshmallow over the fire.',
      exampleTranslation: 'Cô ấy nướng một viên kẹo dẻo trên lửa.'
    });
  } finally {
    global.fetch = previous;
    jest.useRealTimers();
  }
});
