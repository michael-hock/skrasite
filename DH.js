'use strict'
/* The constants P, BSP, LD, LDE must be difined before calling function from this JavaScript library.
   Константы P, BSP, LD, LDE должны быть заданы перед вызовом функций из этой JavaScript-библиотеки.
*/
const FF=0xffffffff, D31=0x80000000, D32=0x100000000, MD31=0x40000000<<1;
var tt=[], rr=[], Q=[];

function SqrMod(a) { // a=(a*a)%p
 var nd, bm, i, over, over2, lnzd, lnzbm, FirstDigDiff_tt, FirstDigDiff_rr;

 for (lnzd=LD; a[lnzd]==0 && lnzd>=0; lnzd--) ;
 for (lnzbm=MD31; lnzbm!=1 && (a[lnzd]&lnzbm)==0; lnzbm>>>=1) ;
 // lnzd - левая ненулевая цифра в a, lnbm - левый ед. бит в ней
 // могут ли быть нулевые остатки?.. на тестовых составных числах м.б.

 if (a[0]&1) // tt:=a соотв. биту № 0 с bm=1
  for (i=0; i<=LD; i++) rr[i]=tt[i]=a[i]; // может тоже пойти в результат, если нулевой бит - единица
 else
  for (i=0; i<=LD; i++) rr[i]=0, tt[i]=a[i];

 nd=0; bm=1; // далее бит № 1 с маской bm = 2 = 0b10
 do {
  if (bm==MD31) bm=1, nd++; else bm<<=1;
  
  FirstDigDiff_tt=tt[LD]*2;
  if (tt[LD-1]>=D31) FirstDigDiff_tt++;
  FirstDigDiff_tt-=P[LD];
  
  if (FirstDigDiff_tt==0) {
   for (i=LD-1; i>0 && FirstDigDiff_tt==0; i--) { // цифра [0] не входит, т.к. на неё не м.б. переноса с несущ. цифры [-1]
    FirstDigDiff_tt=tt[i]*2;
    if (FirstDigDiff_tt>FF) FirstDigDiff_tt-=D32;
    if (tt[i-1]>=D31) FirstDigDiff_tt++;
    FirstDigDiff_tt-=P[i];
   }

   if (FirstDigDiff_tt==0)
    if (tt[0]>=D31) FirstDigDiff_tt = tt[0]*2-D32-P[0];
     else FirstDigDiff_tt = tt[0]*2-P[0];
  }

  over=over2=0;
  if (a[nd]&bm) {
   if ( FirstDigDiff_tt < 0 )    //   IF  a*2 < P a*2 % P = a*2 ; bit = 1
    for (i=0; i<=LD; i++) {
     tt[i]*=2;
     if (over) tt[i]++;
     if (tt[i]>FF) tt[i]-=D32, over=1; else over=0;
     rr[i]+=tt[i];
     if (over2) rr[i]++;
     if (rr[i]>FF) rr[i]-=D32, over2=1; else over2=0;
    }
   else // IF  a*2 >= P  a*2 % P = a*2 - P ; bit=1
    for (i=0; i<=LD; i++) {
     tt[i]*=2;
     if (over>0) tt[i]++;
     if (over<0) tt[i]--;
     tt[i]-=P[i];
     if (tt[i]>FF)
      tt[i]-=D32, over=1;
     else
      if (tt[i]<0) tt[i]+=D32, over=-1; else over=0;
     rr[i]+=tt[i];
     if (over2) rr[i]++;
     if (rr[i]>FF) rr[i]-=D32, over2=1; else over2=0;
    } // of for

   if (over2) FirstDigDiff_rr=1;
    else
     for (i=LD; i>=0; i--)
      if ( (FirstDigDiff_rr= rr[i] - P[i]) != 0) break;

   if (FirstDigDiff_rr>=0) // if rr >= P  rr-=P
    for (i=0, over=0; i<=LD; i++) {
     if (over) rr[i]--;
     rr[i]-=P[i];
     if (rr[i]<0) rr[i]+=D32, over=-1; else over=0;
    }

  }

  else // of if (a[nd]&bm)
   if ( FirstDigDiff_tt < 0 )    // a*2  IF  a*2 < P ; bit = 0
    for (i=0; i<=LD; i++) {
     tt[i]*=2;
     if (over) tt[i]++;
     if (tt[i]>FF) tt[i]-=D32, over=1; else over=0;
    }
   else // a*2-P   IF  a*2 >= P ; bit=0
    for (i=0; i<=LD; i++) {
     tt[i]*=2;
     if (over>0) tt[i]++;
     if (over<0) tt[i]--;
     tt[i]-=P[i];
     if (tt[i]>FF) tt[i]-=D32, over=1;
     else
      if (tt[i]<0) tt[i]+=D32, over=-1; else over=0;
    } // of for

 } while (nd!=lnzd || bm!=lnzbm) // до крайне левой ненулевой цифры в a и крайне левого единичного бита в ней (включительно)

 for (i=0; i<=LD; i++) a[i]=rr[i];

} // of SqrMod(a)


function MultMod(a, b) { // a=(a*b)%p
 var nd, bm, i, over, over2, lnzd, lnzbm, lnzd_a=0, lnzbm_a=1, 
     lnzd_b=0, lnzbm_b=1, ua=0, ub=0, FirstDigDiff_tt, FirstDigDiff_res, m, f, res;

 nd=0; bm=1;
 do {
  if (a[nd]&bm) {
   ua++;
   lnzd_a=nd;
   lnzbm_a=bm;
  }

  if (b[nd]&bm) {
   ub++;
   lnzd_b=nd;
   lnzbm_b=bm;
  }

  if (bm==MD31) bm=1, nd++; else bm<<=1;

 } while (nd<=LD)
 // ua - кол-во бит-единиц в a, ub - т.с. в b 
 if (ua<ub) {
  lnzd=lnzd_a;
  lnzbm=lnzbm_a;
  for (i=0; i<=LD; i++) tt[i]=b[i];  // присвоение копированием значений  
  f=a; // factor - присвоение по ссылке на массив!
  res=rr; // результат будет в глоб. буфере rr, затем оттуда в a  
 }
 else {
  lnzd=lnzd_b;
  lnzbm=lnzbm_b;
  for (i=0; i<=LD; i++) tt[i]=a[i]; // присвоение копированием значений
  f=b; // factor - присвоение по ссылке на массив!
  res=a; // результат будет сразу в a - присвоение по ссылке на массив!
 }

 // если в нулевом бите 0, само множимое как первое слагаемое не идёт, иначе идёт
 if ((f[0]&1)==0) for (i=0; i<=LD; i++) res[i]=0; else for (i=0; i<=LD; i++) res[i]=tt[i];


 // lnzd - левая ненулевая цифра в f, lnbm - левый ед. бит в ней
 if (lnzd!=0 || lnzbm!=1) {  // if f!=1
  nd=0; bm=1; // далее бит № 1 с маской bm = 2 = 0b10
  do {
   if (bm==MD31) {bm=1; nd++} else bm<<=1;

   FirstDigDiff_tt=tt[LD]*2;
   if (tt[LD-1]>=D31) FirstDigDiff_tt++;
   FirstDigDiff_tt-=P[LD];

   for (i=LD-1; i>0 && FirstDigDiff_tt==0; i--) { // цифра [0] не входит, т.к. на неё не м.б. переноса с несущ. цифры [-1]
    FirstDigDiff_tt=tt[i]*2;
    if (FirstDigDiff_tt>FF) FirstDigDiff_tt-=D32;
    if (tt[i-1]>=D31) FirstDigDiff_tt++;
    FirstDigDiff_tt-=P[i];
    // if (FirstDigDiff_tt) break;
   }

   if (FirstDigDiff_tt==0) 
    if (tt[0]>=D31) FirstDigDiff_tt = tt[0]*2-D32-P[0];
    else FirstDigDiff_tt = tt[0]*2-P[0];
    // могут ли быть нулевые остатки?.. на тестовых составных числах м.б.

   over=over2=0;
   if (f[nd]&bm) {
    if ( FirstDigDiff_tt < 0 )    // IF ( tt*2 < P && bit == 1 ) tt = tt*2, res+=tt; 
     for (i=0; i<=LD; i++) {
      tt[i]*=2;
      if (over) tt[i]++;
      if (tt[i]>FF) tt[i]-=D32, over=1; else over=0;
      res[i]+=tt[i];
      if (over2) res[i]++;
      if (res[i]>FF) res[i]-=D32, over2=1; else over2=0;
     }
    else // IF ( tt*2 >= P  && bit==1 ) tt = tt*2-P, res+=tt;
     for (i=0; i<=LD; i++) {
      tt[i]*=2;
      if (over>0) tt[i]++;
      if (over<0) tt[i]--;
      tt[i]-=P[i];
      if (tt[i]>FF)
       tt[i]-=D32, over=1;
      else
       if (tt[i]<0)
        tt[i]+=D32, over=-1;
         else over=0;
      res[i]+=tt[i];
      if (over2) res[i]++;
      if (res[i]>FF) res[i]-=D32, over2=1; else over2=0;
     } // of for
     
    if (over2) FirstDigDiff_res=1;
     else
      for (i=LD; i>=0 ; i--) 
       if ( (FirstDigDiff_res= res[i] - P[i]) != 0) break;

    // нужен ли over=0 или по-любому он и так уже будет равным нулю?
    if (FirstDigDiff_res>=0) // if (res >= P) res-=P
     for (i=0, over=0; i<=LD; i++) {
      if (over) res[i]--;
      res[i]-=P[i];
      if (res[i]<0) res[i]+=D32, over=-1; else over=0;
     }
   }

   else // of if (f[nd]&bm)
    if ( FirstDigDiff_tt < 0 )    // IF ( tt*2 < P && bit == 0 ) tt=tt*2;
     for (i=0; i<=LD; i++) {
      tt[i]*=2;
      if (over) tt[i]++;
      if (tt[i]>FF) { tt[i]-=D32; over=1; } else over=0;
     }
    else // IF ( tt*2 >= P && bit==0 ) tt=tt*2-P;
     for (i=0; i<=LD; i++) {
      tt[i]*=2;
      if (over>0) tt[i]++;
      if (over<0) tt[i]--;
      tt[i]-=P[i];
      if (tt[i]>FF)
       tt[i]-=D32, over=1;
      else
       if (tt[i]<0)
        tt[i]+=D32, over=-1;
         else over=0;
     } // of for

  } while (nd!=lnzd || bm!=lnzbm) // до крайне левой ненулевой цифры в множителе f и крайне левого единичного бита в ней (включительно)
 }

 if (ua<ub) for (i=0; i<=LD; i++) a[i]=rr[i]; // иначе и так уже a====res

} // of MultMod(a)


function PowMod(a, b) {// a=(a^b)%P
 var nd=0, bm=1, lnzd, lnzbm, i;

 for (lnzd=LDE; b[lnzd]==0 && lnzd>=0; lnzd--) ;
 if (lnzd==-1) { // a=(a^0)%P=1%P=1
  a[0]=1;
  for (i=1; i<=LD; i++) a[i]=0;
  return;
 }
 for (lnzbm=MD31; lnzbm!=1 && (b[lnzd]&lnzbm)==0; lnzbm>>>=1) ;

 while (!(b[nd]&bm)) {
  SqrMod(a);
  if (bm==MD31) bm=1, nd++; else bm<<=1; // Q[0]=a, Q[i+1]=(Q[i]^2)%P
 }

 for (i=0; i<=LD; i++) Q[i]=a[i];

 if (nd!=lnzd || bm!=lnzbm)  // если первый справа 1-бит в b не оказался и последним
  do {
   if (bm==MD31) bm=1, nd++; else bm<<=1;
   SqrMod(a);
   if (b[nd]&bm) MultMod(Q, a);

  } while (nd!=lnzd || bm!=lnzbm)

 for (i=0; i<=LD; i++) a[i]=Q[i], Q[i]=tt[i]=rr[i]=0;

}

function GPowMod(a, b) { // const G=2; a=(2^b)%P
 var nd=0, bm=1, nd2, bm2, nfb=0, nb=1, i, k, lnzd, lnzbm;

 // поиск левого единичного бита в показателе степени b
 for (lnzd=LDE; b[lnzd]==0 && lnzd>=0; lnzd--) ;
 if (lnzd==-1) { // a=(2^0)%P=1%P=1
  a[0]=1;
  for (i=1; i<=LD; i++) a[i]=0;
  return;
 }
 for (lnzbm=MD31; lnzbm!=1 && (b[lnzd]&lnzbm)==0; lnzbm>>>=1) ;

 /* подсчёт единичных бит моложе разрядности P
 2^(2^i)%P = 2^(2^i) if 

 2^(2^i) < 2^2048 < P
 2^(2^i) < 2^2048
 2^i < 2048
 2^i < 2^11
 i<11
 0<=i<=10
 BSP=2^11=2048 */

 do {
  if (b[nd]&bm) nfb+=nb;
  nb*=2;
  if (bm==MD31) bm=1, nd++; else bm<<=1;
 } while (nb<BSPM)

 if (nfb!=0) {
  nd2=Math.floor(nfb/32);
  for (i=0; i<nd2; i++) a[i]=0;
  for (i=1, bm2=1; i<=nfb%32; i++) bm2*=2;
  a[nd2]=bm2;
  for (i=nd2+1; i<=LD; i++) a[i]=0;
  // now a=2^SUM, 0< SUM < 2^BSP,  

  i=0;
  do { // GP[0]==(2^BSP)%P==2^BSP-P; GP[i+1] == (GP[i]^2) % P == (2^(BSP+i)) % P
   if (b[nd]&bm) MultMod(a, GP[i]);
   if (nd==lnzd && bm==lnzbm) break;
   if (bm==MD31) bm=1, nd++; else bm<<=1;
   i++;
  } while (nd<=lnzd)

 }
 else { // nfb==0 -> nb==BSP, {nd; bm}== 2^BSP

  i=0; // GP[0]==(2^BSP)%P==2^BSP-P; GP[i+1] == (GP[i]^2) % P == (2^(BSP+i)) % P
  while ((b[nd]&bm)==0) { // ищем первый справа единичный бит в показателе степени b
   i++;
   if (bm==MD31) bm=1, nd++; else bm<<=1;
  }

  for (k=0; k<=LD; k++) a[k]=GP[i][k];

  while (nd!=lnzd || bm!=lnzbm) {
   if (bm==MD31) bm=1, nd++; else bm<<=1;
   i++;
   if (b[nd]&bm) MultMod(a, GP[i]);
  }
 }

 for (i=0; i<=LD; i++) tt[i]=rr[i]=0;

} // of GPowMod(a, b)

