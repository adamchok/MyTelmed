export interface AddressDto {
    id: string;
    address: string;
    postcode: string;
    city: string;
    state: string;
}

export interface RequestAddressDto {
    address: string;
    postcode: string;
    city: string;
    state: string;
}
