// =========================================================================
// DỊCH VỤ TRA CỨU TỪ ĐIỂN & KIỂM TRA ĐỐI CHIẾU NGHĨA TỰ ĐỘNG
// Giúp người học kiểm tra xem mình đã hiểu và dịch đúng từ vựng chưa
// =========================================================================

/**
 * Tra cứu từ vựng tiếng Anh: Lấy phiên âm IPA, loại từ, nghĩa tiếng Việt chuẩn, và ví dụ
 */
export const lookupEnglishWord = async (rawWord) => {
  const word = (rawWord || '').trim();
  if (!word) {
    return { found: false, error: 'Vui lòng nhập từ vựng tiếng Anh' };
  }

  const result = {
    word,
    phonetic: '',
    partOfSpeech: word.includes(' ') ? 'phr' : 'noun',
    meaning: '',
    allMeanings: [],
    example: '',
    exampleTranslation: '',
    found: false
  };

  try {
    // 1. Tra nghĩa tiếng Việt qua Google Translate Single API
    const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(word)}`;
    const transRes = await fetch(transUrl);
    if (transRes.ok) {
      const transData = await transRes.json();
      
      // Bản dịch chính
      const primaryTrans = transData[0]?.[0]?.[0] || '';
      result.meaning = primaryTrans;

      // Các nghĩa phụ & loại từ chi tiết
      if (transData[1] && Array.isArray(transData[1])) {
        const meaningsList = [];
        transData[1].forEach(item => {
          const pos = item[0] || ''; // noun, verb, adjective
          if (!result.partOfSpeech || result.partOfSpeech === 'noun') {
            if (pos === 'verb') result.partOfSpeech = 'verb';
            else if (pos === 'adjective') result.partOfSpeech = 'adj';
            else if (pos === 'adverb') result.partOfSpeech = 'adv';
          }
          const wordsForPos = item[1] || [];
          meaningsList.push(...wordsForPos.slice(0, 4));
        });
        result.allMeanings = Array.from(new Set([primaryTrans, ...meaningsList])).filter(Boolean);
        if (result.allMeanings.length > 0) {
          result.meaning = result.allMeanings.slice(0, 3).join(', ');
        }
      } else {
        result.allMeanings = [primaryTrans];
      }
      result.found = true;
    }
  } catch (err) {
    console.warn('Google Translate API lookup failed:', err);
  }

  try {
    // 2. Tra phiên âm IPA và câu ví dụ tiếng Anh qua Free Dictionary API (cho từ đơn)
    if (!word.includes(' ')) {
      const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const dictRes = await fetch(dictUrl);
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        const entry = dictData[0];
        if (entry) {
          // Phiên âm IPA
          result.phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
          
          // Loại từ
          const meaningObj = entry.meanings?.[0];
          if (meaningObj?.partOfSpeech) {
            const pos = meaningObj.partOfSpeech.toLowerCase();
            if (pos.includes('verb')) result.partOfSpeech = 'verb';
            else if (pos.includes('adj')) result.partOfSpeech = 'adj';
            else if (pos.includes('adv')) result.partOfSpeech = 'adv';
            else if (pos.includes('noun')) result.partOfSpeech = 'noun';
          }

          // Tìm câu ví dụ tiếng Anh
          for (const m of entry.meanings || []) {
            for (const def of m.definitions || []) {
              if (def.example) {
                result.example = def.example;
                break;
              }
            }
            if (result.example) break;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Free Dictionary API lookup failed:', err);
  }

  // Nếu có câu ví dụ nhưng chưa có bản dịch câu ví dụ, dịch câu ví dụ
  if (result.example && !result.exampleTranslation) {
    try {
      const exTransUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(result.example)}`;
      const exRes = await fetch(exTransUrl);
      if (exRes.ok) {
        const exData = await exRes.json();
        result.exampleTranslation = exData[0]?.[0]?.[0] || '';
      }
    } catch (e) {
      // ignore
    }
  }

  return result;
};

/**
 * Kiểm tra xem nghĩa người dùng nhập có khớp với nghĩa chuẩn từ điển không
 */
export const checkUserMeaningAccuracy = (userMeaning, dictionaryResult) => {
  if (!userMeaning || !userMeaning.trim()) {
    return {
      status: 'empty',
      message: 'Chưa có nghĩa để đối chiếu. Bạn có thể sử dụng nghĩa gợi ý từ điển bên dưới.',
      isAccurate: false
    };
  }

  const userWords = userMeaning.toLowerCase().replace(/[,;./]/g, ' ').split(/\s+/).filter(Boolean);
  const dictMeanings = (dictionaryResult.allMeanings || [dictionaryResult.meaning || ''])
    .map(m => m.toLowerCase());

  // Kiểm tra xem có từ nào người dùng nhập xuất hiện trong các nghĩa từ điển không
  let matchFound = false;
  let matchedTerm = '';

  for (const dm of dictMeanings) {
    const dmClean = dm.toLowerCase();
    for (const uw of userWords) {
      if (uw.length >= 2 && dmClean.includes(uw)) {
        matchFound = true;
        matchedTerm = dm;
        break;
      }
    }
    if (matchFound) break;
  }

  if (matchFound) {
    return {
      status: 'good',
      message: `Rất chuẩn xác! Nghĩa bạn dịch khớp với gợi ý: "${matchedTerm}".`,
      isAccurate: true,
      suggestedMeaning: dictionaryResult.meaning
    };
  } else {
    return {
      status: 'warning',
      message: `Nghĩa bạn nhập có thể khác với từ điển thông dụng ("${dictionaryResult.meaning}"). Hãy kiểm tra lại xem có đúng ngữ cảnh TOEIC không nhé!`,
      isAccurate: false,
      suggestedMeaning: dictionaryResult.meaning
    };
  }
};
