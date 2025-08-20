import board from '../../client/src/board.json';

export type Color = 'white' | 'black' | 'gold';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export interface Piece { type: PieceType; color: Color; frozen?: boolean; }
export interface GameState {
  turn: Color;
  pieces: Record<string, Piece>;
  eliminated: Record<Color, boolean>;
}

const order: Color[] = ['white', 'black', 'gold'];

export function createInitial(): GameState {
  const pieces: Record<string, Piece> = {};
  // white pieces
  const whiteBack = ['rook','knight','bishop','queen','king','bishop','knight','rook'];
  for(let x=0;x<8;x++){
    pieces[`s0_${x}`] = { type: whiteBack[x] as PieceType, color: 'white' };
    pieces[`s1_${x}`] = { type: 'pawn', color: 'white' };
  }
  // black pieces
  for(let x=0;x<8;x++){
    pieces[`s7_${x}`] = { type: whiteBack[x] as PieceType, color: 'black' };
    pieces[`s6_${x}`] = { type: 'pawn', color: 'black' };
  }
  // gold pieces left and right regions
  const goldBack = ['rook','knight','bishop','queen'];
  for(let y=2;y<=5;y++){
    pieces[`s${y}_0`] = { type: goldBack[y-2] as PieceType, color: 'gold' };
    pieces[`s${y}_1`] = { type: 'pawn', color: 'gold' };
    pieces[`s${y}_11`] = { type: (['king','bishop','knight','rook'][y-2]) as PieceType, color: 'gold' };
    pieces[`s${y}_10`] = { type: 'pawn', color: 'gold' };
  }
  return { turn: 'white', pieces, eliminated: { white: false, black: false, gold: false } };
}

function squareOf(state: GameState, color: Color, type: PieceType) {
  return Object.keys(state.pieces).find(k => {
    const p = state.pieces[k];
    return p.color === color && p.type === type;
  });
}

function inBounds(x:number,y:number){
  return x>=0 && x<board.width && y>=0 && y<board.height;
}

const dirMap:any = { n:[0,-1], s:[0,1], e:[1,0], w:[-1,0] };

function addIfValid(state:GameState, x:number,y:number, moves:string[], color:Color){
  if(!inBounds(x,y)) return;
  const id=`s${y}_${x}`;
  const piece = state.pieces[id];
  if(!piece) moves.push(id);
  else if(piece.color!==color && !piece.frozen) moves.push(id);
}

function rawMoves(state:GameState, id:string):string[]{
  const piece = state.pieces[id];
  if(!piece || piece.frozen) return [];
  const [yStr,xStr]=id.substring(1).split('_');
  const y=+yStr, x=+xStr;
  const moves:string[]=[];
  switch(piece.type){
    case 'pawn':{
      if(piece.color==='white'){
        addIfValid(state,x,y+1,moves,piece.color);
        if(y===1 && !state.pieces[`s2_${x}`]) addIfValid(state,x,y+2,moves,piece.color);
        addIfValidCapture(state,x-1,y+1,moves,piece.color);
        addIfValidCapture(state,x+1,y+1,moves,piece.color);
        if(y+1===7) markPromotion(moves);
      }else if(piece.color==='black'){
        addIfValid(state,x,y-1,moves,piece.color);
        if(y===6 && !state.pieces[`s5_${x}`]) addIfValid(state,x,y-2,moves,piece.color);
        addIfValidCapture(state,x-1,y-1,moves,piece.color);
        addIfValidCapture(state,x+1,y-1,moves,piece.color);
        if(y-1===0) markPromotion(moves);
      }else{
        const sq = board.squares.find((s:any)=>s.id===id);
        const dir = sq.goldDir;
        const dx = dir==='E'?1:-1;
        addIfValid(state,x+dx,y,moves,piece.color);
        const startCol = dir==='E'?1:10;
        if(x===startCol && !state.pieces[`s${y}_${x+dx}`]) addIfValid(state,x+2*dx,y,moves,piece.color);
        addIfValidCapture(state,x+dx,y+1,moves,piece.color);
        addIfValidCapture(state,x+dx,y-1,moves,piece.color);
        if((dir==='E' && x+dx===11) || (dir==='W' && x+dx===0)) markPromotion(moves);
      }
      break;
    }
    case 'rook':{
      slide(state,x,y,moves,piece.color,[[1,0],[-1,0],[0,1],[0,-1]]); break;
    }
    case 'bishop':{
      slide(state,x,y,moves,piece.color,[[1,1],[1,-1],[-1,1],[-1,-1]]); break;
    }
    case 'queen':{
      slide(state,x,y,moves,piece.color,[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]); break;
    }
    case 'king':{
      [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx,dy])=>{
        addIfValid(state,x+dx,y+dy,moves,piece.color);
      });
      break;
    }
    case 'knight':{
      [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]].forEach(([dx,dy])=>{
        addIfValid(state,x+dx,y+dy,moves,piece.color);
      });
      break;
    }
  }
  return moves;
}

function slide(state:GameState,x:number,y:number,moves:string[],color:Color,dirs:number[][]){
  dirs.forEach(([dx,dy])=>{
    let cx=x+dx, cy=y+dy;
    while(inBounds(cx,cy)){
      const id=`s${cy}_${cx}`;
      const piece=state.pieces[id];
      if(!piece){ moves.push(id); }
      else{ if(piece.color!==color && !piece.frozen) moves.push(id); break; }
      cx+=dx; cy+=dy;
    }
  });
}

function addIfValidCapture(state:GameState,x:number,y:number,moves:string[],color:Color){
  if(!inBounds(x,y)) return;
  const id=`s${y}_${x}`;
  const piece=state.pieces[id];
  if(piece && piece.color!==color && !piece.frozen) moves.push(id);
}

function markPromotion(moves:string[]){ (moves as any).promote=true; }

export function generateLegalMoves(state:GameState, from:string){
  const raw = rawMoves(state, from);
  const legal:string[]=[];
  raw.forEach(to=>{
    const copy:GameState=JSON.parse(JSON.stringify(state));
    applyMove(copy,{from,to});
    if(!isCheck(copy,state.pieces[from].color)) legal.push(to);
  });
  return legal;
}

export function isCheck(state:GameState, color:Color){
  const kingSq = squareOf(state,color,'king');
  if(!kingSq) return false;
  return Object.entries(state.pieces).some(([id,p])=>{
    if(p.color===color || p.frozen) return false;
    const moves=rawMoves(state,id);
    return moves.includes(kingSq);
  });
}

export function applyMove(state:GameState, move:{from:string,to:string}){
  const piece = state.pieces[move.from];
  if(!piece) return;
  const target = state.pieces[move.to];
  if(target && target.type==='king') state.eliminated[target.color]=true, target.frozen=true;
  delete state.pieces[move.from];
  state.pieces[move.to]=piece;
  // promotion
  const [yStr,xStr]=move.to.substring(1).split('_');
  const y=+yStr, x=+xStr;
  if(piece.type==='pawn'){
    if(piece.color==='white' && y===7) piece.type='queen';
    else if(piece.color==='black' && y===0) piece.type='queen';
    else if(piece.color==='gold' && (x===0 || x===11)) piece.type='queen';
  }
  // next turn
  let idx=(order.indexOf(state.turn)+1)%3;
  for(let i=0;i<3;i++){
    const c=order[idx];
    if(!state.eliminated[c]){ state.turn=c; break; }
    idx=(idx+1)%3;
  }
}
