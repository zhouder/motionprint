import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { onAccept: () => void; }

export const PrivacyNotice: React.FC<Props> = ({ onAccept }) => {
  const { t } = useLanguage();

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{t.privacyTitle}</h2>
        <p>{t.privacyIntro}</p>
        <ul className="privacy-list">
          <li>{t.privacyItem1}</li>
          <li>{t.privacyItem2}</li>
          <li>{t.privacyItem3}</li>
          <li>{t.privacyItem4}</li>
          <li>{t.privacyItem5}</li>
          <li>{t.privacyItem6}</li>
          <li>{t.privacyItem7}</li>
          <li>{t.privacyItem8}</li>
        </ul>
        <div className="privacy-highlight">
          {t.privacyHighlight}
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onAccept}>
            {t.privacyAccept}
          </button>
        </div>
      </div>
    </div>
  );
};