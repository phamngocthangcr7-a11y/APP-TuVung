import { cardError, parseBatch, suggestCard } from './cardEntry';

test('preserves hyphenated terms and assigns all four pasted columns to the same card', () => {
  const [row] = parseBatch('follow-up\tviệc theo dõi\tWe sent a follow-up email.\tChúng tôi đã gửi email theo dõi.');
  expect(row.word).toBe('follow-up');
  expect(cardError(row)).toBe('');
  expect(row.exampleTranslation).toBe('Chúng tôi đã gửi email theo dõi.');
});

test('keeps translation blank when a learner supplies a different example', () => {
  const [row] = parseBatch('abide by | tuân theo | We abide by the agreement.');
  expect(row.example).toBe('We abide by the agreement.');
  expect(row.exampleTranslation).toBe('');
  expect(cardError(row)).toMatch(/bản dịch/i);
});

test('resolves a known term with no network and rejects incomplete unknown terms', async () => {
  const previous = global.fetch;
  global.fetch = jest.fn();
  try {
    const known = await suggestCard({ word: 'abandon' });
    expect(known.partOfSpeech).toBe('verb');
    expect(cardError(known)).toBe('');
    expect(global.fetch).not.toHaveBeenCalled();
    const [unknown] = parseBatch('xylothetical -> thử nghiệm');
    expect(unknown.meaning).toBe('thử nghiệm');
    expect(cardError(unknown)).toMatch(/ví dụ/i);
  } finally { global.fetch = previous; }
});

test('fills all bilingual examples from the pasted list and corrects known typos', () => {
  const sample = [
    'practical : thiết thực, thực tế', 'synthetic :Tổng hợp, nhân tạo', 'interior design: thiết kế nội thất',
    'Alteranative: sự lựa chọn khác, thay thế', 'Nevertheless: mặc dù', 'Countless: vô số', 'Produce :tạo ra, sản xuất ra',
    'Captivating: cuốn hút, hấp dẫn', 'Streamlined: tinh gọn , mượt mà', 'Portfolio: danh mục', 'In contrast : trái ngược lại',
    'Substantially: một cách đáng kể', 'National park: công viên quốc gia', 'Redeem :quy đổi', 'Adventure: chuyến phiêu lưu',
    'Troubleshoot: khắc phục sự cố, sữa lỗi', 'Rarely: hiến khi', 'Portable : đi động dễ dàng mang theo'
  ];
  const cards = parseBatch(sample.map(line => '-       ' + line).join('\n\n'));
  expect(cards).toHaveLength(18);
  expect(cards.map(cardError)).toEqual(Array(18).fill(''));
  expect(cards[3].word).toBe('alternative');
  expect(cards[4].meaning).toBe('tuy vậy, dù vậy');
});
