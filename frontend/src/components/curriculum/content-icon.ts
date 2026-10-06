import {
FiBookOpen,
FiFileText,
FiFilm,
FiLayers,
FiMusic
} from 'react-icons/fi';
export function contentIcon(type: string) {
 switch (type) {
 case 'VIDEO':
 return FiFilm;
 case 'AUDIO':
 return FiMusic;
 case 'PDF':
 return FiFileText;
 case 'MIXED':
 return FiLayers;
 default:
 return FiBookOpen;
 }
}
