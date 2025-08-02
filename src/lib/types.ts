
export interface itemStructure {
    id : number,
    name : string,
    cover : string,
    banner : string,
    release : string,
    type : string
}

export interface listStructure {
    id : number,
    name : string,
    desc : string | undefined,
    items : itemStructure [] | undefined
}

export interface itemReview {
    score : number | undefined,
    md : string | undefined,
    sub : string,
    date : string
    rewatch : boolean | false

}

export interface displayReview {
    review : itemReview,
    item : itemStructure

}

export interface groupedAwards {
    year : number,
    awards : Record<string, any[]>
}