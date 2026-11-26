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

