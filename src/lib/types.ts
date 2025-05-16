
export interface itemStructure {
    id : number,
    name : string,
    cover : string,
    banner : string,
    release : string,
    type : string
}

export interface itemReview {
    score : number | undefined,
    md : string | undefined,
    sub : string,
    date : string

}

export interface displayReview {
    review : itemReview,
    item : itemStructure

}

export interface groupedAwards {
    year : number,
    awards : Record<string, any[]>
}