export interface AddressDto {
    id: string;
    addressName: string;
    address1: string;
    address2?: string;
    postcode: string;
    city: string;
    state: string;
}

export interface RequestAddressDto {
    addressName: string;
    address1: string;
    address2?: string;
    postcode: string;
    city: string;
    state: string;
}
