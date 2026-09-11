import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@locale/en.json'
import ko from '@locale/ko.json'

//const language = navigator.language.split('-')[0];

const language = 'en'

i18n.use(initReactI18next).init({

    resources: {
        ko: {translation: ko},
        en: {translation: en}
    },    
    lng: language, // 기본 언어 설정
    fallbackLng: 'ko', // 번역이 없을 경우 사용할 언어
    interpolation: { escapeValue: false}    
})

export default i18n;
