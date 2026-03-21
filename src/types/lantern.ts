export interface VolumeInputs {
  n: number
  s: number
  h0: number
  h1: number
  h2: number
}

export interface VolumeResult {
  n: number
  R: number
  K: number
  A: number
  H: number
  V: number
}

export interface PatternInputs {
  a: number
  b: number
  hb: number
  hm: number
  ht: number
  n: number
  hspike: number;
  ltail: number;
}

export interface AreaResult {
  arect: number
  akite: number
  atop: number
  atail: number
  aglue: number
  anet: number
  q: number
}

export interface FoldState {
  theta: number
  vOpen: number
}