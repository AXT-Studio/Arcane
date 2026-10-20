;; AXT Arcaneの ModOpsFast の内部で用いられるwasmモジュールです。
;; このモジュールは以下の関数を持ち、同名で公開しています。
;; - mul: (a: i32, b: i32, p: i32) => i32 ... (a * b) mod p
;; - mulAdd: (a: i32, b: i32, c: i32, d: i32, p: i32) => i32 ... (a * b + c * d) mod p
;; - pow: (a: i32, b: i32, p: i32) => i32 ... (a ** b) mod p
;; - inv: (a: i32, p: i32) => i32 ... av≡1 (mod p)を満たす0以上p未満の唯一の整数v (1÷a≡v(mod p))
;; - div: (a: i32, b: i32, p: i32) => i32 ... (a / b) mod p
(module
    ;; mul: (a: i32, b: i32, p: i32) => i32 ... (a * b) mod p
    (func $mul (param $a i32) (param $b i32) (param $p i32) (result i32)
        local.get $a        ;; -> [a: i32]
        i64.extend_i32_u    ;; -> [a: i64]
        local.get $b        ;; -> [a: i64, b: i32]
        i64.extend_i32_u    ;; -> [a: i64, b: i64]
        i64.mul             ;; -> [ab: i64]
        local.get $p        ;; -> [ab: i64, p: i32]
        i64.extend_i32_u    ;; -> [ab: i64, p: i64]
        i64.rem_u           ;; -> [ab % p: i64]
        i32.wrap_i64        ;; -> [ab % p: i32]
    )

    ;; mulAdd: (a: i32, b: i32, c: i32, d: i32, p: i32) => i32 ... (a * b + c * d) mod p
    (func $mulAdd (param $a i32) (param $b i32) (param $c i32) (param $d i32) (param $p i32) (result i32)
        local.get $a        ;; -> [a: i32]
        i64.extend_i32_u    ;; -> [a: i64]
        local.get $b        ;; -> [a: i64, b: i32]
        i64.extend_i32_u    ;; -> [a: i64, b: i64]
        i64.mul             ;; -> [ab: i64]
        local.get $c        ;; -> [ab: i64, c: i32]
        i64.extend_i32_u    ;; -> [ab: i64, c: i64]
        local.get $d        ;; -> [ab: i64, c: i64, d: i32]
        i64.extend_i32_u    ;; -> [ab: i64, c: i64, d: i64]
        i64.mul             ;; -> [ab: i64, cd: i64]
        i64.add             ;; -> [ab+cd: i64]
        local.get $p        ;; -> [ab+cd: i64, p: i32]
        i64.extend_i32_u    ;; -> [ab+cd: i64, p: i64]
        i64.rem_u           ;; -> [ab+cd % p: i64]
        i32.wrap_i64        ;; -> [ab+cd % p: i32]
    )

    ;; pow: (a: i32, b: i32, p: i32) => i32 ... (a ** b) mod p
    (func $pow (param $a i32) (param $b i32) (param $p i32) (result i32)
        ;; ローカル変数を定義
        (local $base i32)
        (local $exp i32)
        (local $res i32)
        ;; 初期化
        local.get $a     ;; -> [a: i32]
        local.set $base  ;; -> [] (base = a: i32)
        local.get $b     ;; -> [a: i32]
        local.set $exp   ;; -> [] (exp = b: i32)
        i32.const 1      ;; -> [1: i32]
        local.get $p     ;; -> [1: i32, p: i32]
        i32.rem_u        ;; -> [1%p: i32]
        local.set $res   ;; -> [] (res = 1%p: i32)
        ;; 繰り返しパート
        (block $done
            (loop $repeat
                ;; exp === 0なら終了
                local.get $exp  ;; -> [exp: i32]
                i32.eqz         ;; -> [0 or 1: i32] (exp === 0のときに限り1、そうでないとき0)
                br_if $done     ;; -> [] (1がpopされた場合blockを抜ける、そうでない場合単にpopするだけで空になる)
                ;; exp & 1 が真なら res *= base (そのbitが立ってたら掛けたくて、それは&1が1かどうかで判定できる)
                local.get $exp       ;; -> [exp: i32]
                i32.const 1          ;; -> [exp: i32, 1: i32]
                i32.and              ;; -> [exp&1: i32] (0か1)
                if                   ;; -> [] (0がpopされたらendまで飛ぶ、そうでなければifの中身を実行する)
                    local.get $res   ;; -> [res: i32]
                    local.get $base  ;; -> [res: i32, base: i32]
                    local.get $p     ;; -> [res: i32, base: i32, p: i32]
                    call $mul        ;; -> [(res*base)%p: i32]
                    local.set $res   ;; -> [] (res = (res*base)%p: i32)
                end
                ;; base = base * base % p
                local.get $base  ;; -> [base: i32]
                local.get $base  ;; -> [base: i32, base: i32]
                local.get $p     ;; -> [base: i32, base: i32, p: i32]
                call $mul        ;; -> [(base*base)%p: i32]
                local.set $base  ;; -> [] (base = (base*base)%p: i32)
                ;; exp >>>= 1
                local.get $exp  ;; -> [exp: i32]
                i32.const 1     ;; -> [exp: i32, 1: i32]
                i32.shr_u       ;; -> [exp>>>1: i32]
                local.set $exp  ;; -> [] (exp = exp>>>1: i32)
                ;; ループ先頭に戻る
                br $repeat
            )
        )
        ;; resが答え
        local.get $res ;; -> [res: i32]
    )

    ;; inv: (a: i32, p: i32) => i32 ... av≡1 (mod p)を満たす0以上p未満の唯一の整数v (1÷a≡v(mod p))
    ;; ※逆元が存在しなければ代わりに-1を返す
    (func $inv (param $a i32) (param $p i32) (result i32)
        ;; ローカル変数を定義
        (local $r0 i64)
        (local $r1 i64)
        (local $x0 i64)
        (local $x1 i64)
        (local $q i64)
        (local $temp i64)
        ;; 初期化
        local.get $a      ;; -> [a: i32]
        i64.extend_i32_u  ;; -> [a: i64]
        local.set $r0     ;; -> [] (r0 = a: i64)
        local.get $p      ;; -> [p: i32]
        i64.extend_i32_u  ;; -> [p: i64]
        local.set $r1     ;; -> [] (r1 = p: i64)
        i64.const 1       ;; -> [1: i64]
        local.set $x0     ;; -> [] (x0 = 1: i64)
        ;; x1は0であってほしいが、そもそもデフォで0なので触らなくてOK
        ;; 拡張ユークリッドの互除法 (r1が0になるまで繰り返す)
        (block $done
            (loop $repeat
                ;; r1 === 0なら終了
                local.get $r1  ;; -> [r1: i64]
                i64.eqz        ;; -> [0 or 1: i32] (r1 === 0のときに限り1、そうでないとき0)
                br_if $done    ;; -> [] (1がpopされた場合blockを抜ける、そうでない場合単にpopするだけで空になる)
                ;; q = r0 / r1
                local.get $r0  ;; -> [r0: i64]
                local.get $r1  ;; -> [r0: i64, r1: i64]
                i64.div_s      ;; -> [r0/r1: i64]
                local.set $q   ;; -> [] (q = r0/r1: i64)
                ;; (r0, r1) = (r1, r0 % r1)
                local.get $r1  ;; [r1: i64]
                local.get $r0  ;; [r1: i64, r0: i64]
                local.get $r1  ;; [r1: i64, r0: i64, r1: i64]
                i64.rem_s      ;; [r1: i64, r0%r1: i64]
                local.set $r1  ;; [元r1: i64] (r1 = r0%元r1: i64)
                local.set $r0  ;; [] (r0 = 元r1: i64)
                ;; (x0, x1) = (x1, x0 - q * x1)
                local.get $x1  ;; [x1: i64]
                local.get $x0  ;; [x1: i64, x0: i64]
                local.get $q   ;; [x1: i64, x0: i64, q: i64]
                local.get $x1  ;; [x1: i64, x0: i64, q: i64, x1: i64]
                i64.mul        ;; [x1: i64, x0: i64, q*x1: i64]
                i64.sub        ;; [x1: i64, x0-q*x1: i64]
                local.set $x1  ;; [元x1: i64] (x1 = x0-q*元x1: i64)
                local.set $x0  ;; [] (x0 = 元x1: i64)
                ;; ループ先頭に戻る
                br $repeat
            )
        )
        ;; r0 !== 1なら逆元が存在しないので-1を返す
        local.get $r0     ;; -> [r0: i64]
        i64.const 1       ;; -> [r0: i64, 1: i64]
        i64.ne            ;; -> [0 or 1: i32] (r0 !== 1のときに1、そうでないとき0)
        if                ;; -> [] (0がpopされたらendまで飛ぶ、そうでなければifの中身を実行する)
            i32.const -1  ;; -> [-1: i32]
            return
        end
        ;; 逆元が存在する場合、それはx0をnormalizeしたものなのでそれを返す
        local.get $x0     ;; -> [x0: i64]
        local.get $p      ;; -> [x0: i64, p: i32]
        i64.extend_i32_u  ;; -> [x0: i64, p: i64]
        i64.rem_s         ;; -> [x0 % p: i64] ※この時点では負の可能性があり、その場合pを加算する必要がある
        local.set $temp   ;; -> [] (temp = x0 % p: i64)
        local.get $temp   ;; -> [temp: i64]
        i64.const 0       ;; -> [temp: i64, 0: i64]
        i64.lt_s          ;; -> [0 or 1: i32] (r0 < 0のときに1、そうでないとき0)
        if                ;; -> [] (0がpopされたらendまで飛ぶ、そうでなければifの中身を実行する)
            local.get $temp   ;; -> [temp: i64]
            local.get $p      ;; -> [temp: i64, p: i32]
            i64.extend_i32_u  ;; -> [temp: i64, p: i64]
            i64.add           ;; -> [temp + p: i64]
            local.set $temp   ;; -> [] (temp += p: i64)
        end
        ;; この段階でスタックは[x0 % p: i64]で、かつ0 <= x0 < pが保証される
        local.get $temp   ;; -> [[x0 % p: i64]
        i32.wrap_i64      ;; -> [x0 % p: i32]
    )

    ;; div: (a: i32, b: i32, p: i32) => i32 ... (a / b) mod p
    ;; ※逆元が存在しなければ代わりに-1を返す
    (func $div (param $a i32) (param $b i32) (param $p i32)(result i32)
        ;; ローカル変数の定義
        (local $temp i32)
        ;; 逆元を inv(b, p) で計算する
        local.get $b     ;; -> [b: i32]
        local.get $p     ;; -> [b: i32, p: i32]
        call $inv        ;; -> [b^(-1): i32]
        local.set $temp  ;; -> [] (temp = b^(-1): i32)
        ;; 逆元が存在しない場合は-1を返す
        local.get $temp   ;; -> [temp: i32]
        i32.const -1      ;; -> [temp: i32, -1: i32]
        i32.eq            ;; -> [0 or 1: i32] (temp = -1のときに1、そうでないとき0)
        if                ;; -> [] (0がpopされたらendまで飛ぶ、そうでなければifの中身を実行する)
            i32.const -1  ;; -> [-1: i32]
            return
        end
        ;; 逆元が存在する場合は、 a * b^(-1) mod pを返す
        local.get $a     ;; -> [a: i32]
        local.get $temp  ;; -> [a: i32, b^(-1): i32]
        local.get $p     ;; -> [a: i32, b^(-1): i32, p: i32]
        call $mul        ;; -> [a * b^(-1) mod p: i32]
    )

    ;; exports
    (export "mul" (func $mul))
    (export "mulAdd" (func $mulAdd))
    (export "pow" (func $pow))
    (export "inv" (func $inv))
    (export "div" (func $div))
)
