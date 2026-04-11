// ================================================================
// Exports
// ================================================================

/**
 * ユニークIDを生成するためのメソッド群を提供するユーティリティクラスです。
 * - UUIDv7の生成
 */
export class UniqueID {
    /**
     * UUIDv7を生成します。
     * UNIXタイムスタンプを指定した場合、そのタイムスタンプに基づいてUUIDv7を生成します。指定しない場合は現在のタイムスタンプを使用します。
     *
     * 時間計算量: O(1)
     *
     * @example 現在時刻に基づいてUUIDv7を生成する例
     * ```ts
     * const uuid1 = UniqueID.generateUUIDv7();
     * console.log(uuid1); // => 例: "019a7071-5fdd-7fcb-9e75-ba83228b7c1d"
     * ```
     *
     * @example タイムスタンプを指定してUUIDv7を生成する例
     * ```ts
     * const uuid2 = UniqueID.generateUUIDv7(1672531199000);  // 2023-01-01 08:59:59 GMT+0900のタイムスタンプ
     * console.log(uuid2); // => 例: "01856aa0-c418-784f-94e1-7271487db7ef" (timestampに基づいて生成されたUUID)
     * ```
     *
     * @param [timestamp] - UUIDv7の生成に使用するUNIXタイムスタンプ (ミリ秒単位)。省略した場合は現在のタイムスタンプが使用されます。
     * @returns 生成されたUUIDv7
     */
    static generateUUIDv7(timestamp: number = Date.now()): string {
        // Validation: タイムスタンプが整数かつ48bit以内であることを確認
        if (
            typeof timestamp !== "number" ||
            !Number.isInteger(timestamp) ||
            timestamp < 0 ||
            timestamp > 2 ** 48 - 1
        ) {
            throw new TypeError(
                "Timestamp must be a non-negative integer not greater than 2**48-1 (48 bits).",
            );
        }
        // UUIDv7でランダムな部分を残すためのビットマスク用の値を定義
        const RANDOM_PART_MASK = 0x0000000000000fff3fffffffffffffffn;
        // とりあえず128bitの乱数をつくってBigIntにする
        const randomUint8Array = new Uint8Array(16);
        crypto.getRandomValues(randomUint8Array);
        const randomHexString = Array.from(randomUint8Array, (byte) =>
            byte.toString(16).padStart(2, "0"),
        ).join(""); // Note: Uint8Array.toHex()がサポートされればそれでOK
        const randomBigInt = BigInt(`0x${randomHexString}`);
        // UUIDv7文字列の元になる1つのBigIntを作成する
        const uuidBigInt =
            (BigInt(timestamp) << 80n) | // タイムスタンプを上位48ビットに配置
            (7n << 76n) | // UUIDのバージョン番号
            (2n << 62n) | // UUIDのバリアント
            (randomBigInt & RANDOM_PART_MASK); // ランダム部分
        // UUIDv7文字列を生成する (8文字-4文字-4文字-4文字-12文字の形式)
        return uuidBigInt
            .toString(16)
            .padStart(32, "0")
            .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5")
            .toLowerCase();
    }
}
