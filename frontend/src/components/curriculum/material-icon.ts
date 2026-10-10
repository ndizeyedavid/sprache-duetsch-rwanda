import {
FiBookOpen,
FiFileText,
FiFilm,
FiLayers,
FiLink,
FiMusic
} from 'react-icons/fi';
export function materialIcon(type: string) {
 switch (type) {
 case 'VIDEO':
 return FiFilm;
 case 'AUDIO':
 return FiMusic;
 case 'PDF':
 return FiFileText;
 case 'LINK':
 return FiLink;
 case 'SLIDE':
 return FiLayers;
 default:
 return FiBookOpen;
 }
}
