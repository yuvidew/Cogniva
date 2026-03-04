import {parseAsInteger, parseAsString, parseAsStringLiteral} from "nuqs/server";
import {PAGINATION} from "@/config/constants";

export const agentsParams = {
    page : parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE)
        .withOptions({
            clearOnDefault : true
        }),
    pageSize : parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({
            clearOnDefault : true
        }),
    search : parseAsString
        .withDefault("")
        .withOptions({
            clearOnDefault : true
        }),
    filter : parseAsStringLiteral(["all", "active", "inactive"])
        .withDefault("all")
        .withOptions({
            clearOnDefault : true
        }),
}