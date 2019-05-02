
<!--size: 16:9 -->
<!--headingDivider: 2 -->
<!-- theme: test-theme -->
<!--style: |
  code {
    background-color: #f6f8fa;
    color: #55636a;
  } -->


# <!--fit--> Input Language of CLINGO 

戸塚悠太郎　輪講
19/4/24

## Table of contents

* Rules
* Directives and Comments
* Arithmetric
* Definitions
* Choice Rules
* Global and Local Variablles
* Constraints
* Anonymous Variables

## Rules

``` Prolog
large(C) :- size(C,S1), size(uk,S2), S1 > S2.

```

* 意味は「`C`の大きさが`S1`かつ`uk`の大きさは`S2`かつ`S1 > S2`ならば`C`は大きい」
* `large(C)`は**head**(頭部)
* `size(C,S1), size(uk,S2), S1 > S2`は**body**(本体)
  * `:-`がないルールは、bodyがないルールとして扱う。
  * コンマで区切られた表現は、論理積$\wedge$と同じ

---

``` Prolog
large(C) :- size(C,S1), size(uk,S2), S1 > S2.

```

* `large(C)`,`size(C,S1)`,`size(uk,S2)`は**atom**
  * 関係や性質を表すpredicate(述語) symbolとカッコ内の引数のリスト（任意）からなる
* `S1>S2`は**comparison**
  * `=`, `!=`, `<`, `>`, `<=`, `>=`のいずれかのシンボルと、その両側の二つの引数からなる

---

``` Prolog
large(C) :- size(C,S1), size(uk,S2), S1 > S2.
```

* 引数になる表現を**term**と呼ぶ
  * Symbolic constraint - 小文字から始まる文字、数字、アンダ-スコアの文字列
  * Numeric constraint - 10進数の整数
  * Variables - 大文字から始まる文字、数字、アンダースコアの文字列
  * 複雑なtermは後述
* Atomやruleなどの内、variableがないものを**ground**であるといい、「事実」を示す
  * ex) `size(uk,64).`

---

### Stable modelの導出

``` Prolog
large(C) :- size(C,S1), size(uk,S2), S1 > S2.
size(uk,64).  size(france,65).
```

`large(france)`がstable modelに含まれるのは、`C`,`S1`,`S2`をそれぞれ`france`, `65`, `64`に置き換えた

``` Prolog
large(france) :- size(france,65), size(uk,64), 65 > 64.
```

が存在するからである

* bodyのatomは事実として与えられている
* comparisonは真である

---

* `p(X) :- X > 7.`のような無限にstable modelが存在するようなルールは”unsafe variable”のエラーで実行できない
* `size(uk,64). size(france,65).`は
`size(france,65; uk,64).`のように省略して書くことができる (**pooling**)

## Directives and Comments

* `#show p/2.`
  * predicate symbolがpで引数が2のもの以外を表示しない
    * clingoでは、同じpredicates symbolでも引数の数が異なれば別の述語として扱う
* `#const c0=uk.`
  * symbolic constraint `c0`を定数`uk`に置き換える
  * コマンドラインオプション `-c c0=uk`も同じ
* `#include “large_input.lp”.`
  * 他のファイルを連結する
  * コマンドから`% clingo large.lp large_input.lp`も同じ
* %から行末まではコメント


## Arithmetric

* 変数、定数と以下のシンボルで複雑なtermを表現できる
* `+`,`*`,`**`(べき乗),`/`(整数除算),`\`(除算のあまり),`||`(絶対値)
* `-`,`&`(bit AND),`?`(bit OR), `^`(bit XOR), `~`(bit NOT) (?)
* `0..3`は集合$\{0,1,2,3\}$を示す。(**interval**)
  * ex) `p(N,N*N+N+41) :- N = 0..2.` のstable modelは
`p(0, 41) p(1, 43) p(2, 47)`
    * `N=0..2`は$N\in\{0,1,2\}$を表す
  * ex) `p(0..2).`は`p(0; 1; 2).`と同じ
  * ex) `p(0..2,0..1).`は `p(0,0; 0,1; 1,0; 1,1; 2,0; 2,1).`と同じ

## Definitions
* 多くのルールは定義として見ることができる
  * ex) grandparent/2はparent/2を使って次のように表現できる

    ```Prolog
      grandparent(X, Z) :- parent(X, Y), parent(Y, Z)
    ```
* predicateは複数の定義から成ることもある
    ```Prolog
    parent(X, Y) :- mother(X, Y).
    parent(X, Y) :- father(X, Y).
    ```
* predicateは再帰的に定義することができる
    ```Prolog
    ancestor(X, Y) :- parent(X, Y).
    ancestor(X, Z) :- ancestor(X, Y), ancestor(Y, Z).
    ```

---

* 1ステップで定義できないこともある
  ```Prolog
  composite(N) :- N= 1..5, I = 2..N-1, N\I=0.
  prime(N) :- N=2..5, not composite(N).
  ```
* notは**negation as failure**を示す
  * 導出できない時に真になる
  * ex) not composite(3)はプログラムの他の部分からcomposite(3)が導出できない時に真

## Choice Rules

* ASPでは複数のstable modelが存在するものを扱うことが多い
* `{p(a); q(b)}.`は`p(a)`, `q(b)`がそれぞれ含まれるかを選んだ全ての通りのモデルを表すルールである
  * このルールだけの場合、stable modelは$\phi$, p(a), q(b), p(a)q(b)の4通り
  * 全てのstable modelを見るためには`% clingo choice.lp 0`で実行
* poolingとintervalを利用することもできる
  * `{p(1;2;3)}.`と`{p(1..3)}.`は`{p(1); p(2); p(3)}.`と同じ

---

* モデルに含まれる要素の数の上限と下限を`1 {p(1..3)} 2.`のように定義できる
  * このルールのみのstable modelは`p(1), p(2), p(3), p(1)p(2), p(1)p(3), p(2)p(3)`
  * 下限や上限のみを指定することもできる
  * 下限と上限が等しい時`{p(1..3)}=2.`のように書ける

## Global and Local variables

* Choice ruleのbodyには変数を含めることもできる(**Global variables**)
  * `{p(X); q(X)} = 1 :- X=1..2.`は`p(1)`か`q(1)`のいずれかと、`p(2)`と`q(2)`のいずれかを安定モデルに含む
  * `{p(1); q(1)} = 1. {p(2); q(2)} = 1.`と同じ

* **Local variables** はChoice ruleのカッコ内のatomを、すでに定義されているpredicateで定義したい時に利用できる
  * person/1が定義されている時、`{elected(X) : person(X)} = 3.`でstable modelは当選した人が3人のみになる
  * `person(ann; bob; carol; dan; elaine; fred)`ならば、上の式は
  `{elected(ann; bob; carol; dan; elaine; fred)} = 3` と同じ

## Constraints

* Headがないルールは**constraint**であり、bodyを満たすmodelはstable modelとならないという制約を示す
  * `:- p(1).` の時、stable modelは`p(1)`を含まない
  * `:- not p(1).` の時、stable modelは必ず`p(1)`を含む
  * `:- p(1), p(2).`の時、`p(1)`と`p(2)`を両方含むmodelはstable modelにならない

---

* constraintは変数を含むことができる
  * `:- p(X), q(X).`はp/1とq/1が互いに素であることを示す（p/1とq/1を同時に満たす要素が存在しないstable modelを排除する)
* comparisonを含むこともできる
  * `:- f(X, Y1), f(X, Y2), Y1 != Y2.`はf/2が関数であることを示す
  * constraintのbodyのcomparisonは、headの逆のcomparisonに置き換えることができる
    * ex) `Y1 = Y2 :- f(X, Y1), f(X, Y2).`

## Anonymous Variables

* filled/3は`filled(R, C, X)`が行R列Cに値Xが入っている表を表すとする。
* `R1 = R2 :- filled(R1, C1, X), filled(R2, C2, X).`は同じ値は同じ行にしか入らないことを示している。
  * C1,C2は一度しか使われていない
* 上記のような一度しか登場しない変数はアンダースコアに置き換えることができる
  `R1 = R2 :- filled(R1, _, X), filled(R2, _, X).`

---

* 内部的には補助的な述語に置換されている
  ```Prolog
  R1 = R2 :- aux(R1, X), aux(R2, X).
  aux(R, X) :- filled(R, Var, X).
  ```

  * aux/2は結果には表示されない
* この処理方法は特に否定が利用される場合に重要である
  * `{p(1..2)}. :- not p(Var).`は`Var`についてunsafeとしてエラーとなる
  * `{p(1..2)}. :- not p(_).`は以下に置換されて、`p(1), p(2), p(1)p(2)`のstable modelが出力される
    ```Prolog
      {p(1..2)}.
      aux :- p(Var).
      :- not aux.
    ```
