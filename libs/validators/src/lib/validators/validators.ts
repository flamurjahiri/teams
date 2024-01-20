import {any, string} from 'joiful';

export const enumerate = (e: { [s: number]: string }) => string().valid(Object.keys(e).map(k => e[k]));

export const stringify = () => any().custom(({joi}) => joi.custom((value) => `${value}`)).empty('');

export const toArray = () => any().custom(({joi}) => joi.custom((value) => Array.isArray(value) ? value : (value ? [value] : [])))
