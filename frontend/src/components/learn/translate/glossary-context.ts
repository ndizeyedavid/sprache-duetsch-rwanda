import { createContext,useContext } from 'react';
import type { Glossary } from '../types';

/** The open lesson's glossary; GermanText reads it to make words tappable. */
export const GlossaryContext = createContext<Glossary>({});

export const useGlossary = () => useContext(GlossaryContext);
