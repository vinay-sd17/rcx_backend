// SPDX-License-Identifier: GPL-3.0
pragma solidity >0.7.0 <= 0.9.0;

import "../model/rcx-nft-vehicle-gallery.model.sol";
import "../model/rcx-nft-vehicle.model.sol";

    struct RcxNftDetails {
        string name;
        string mobile;
        string email;
        VehicleDetails vehicleDetails;
        VehicleGallery[] gallery;

    }
