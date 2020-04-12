var filenames = ['./files/sub-010001_ses-02_anat_sub-010001_ses-02_acq-lowres_FLAIR.nii.gz'];
export var files = filenames.map(function(v) {
    return '../' + v;
});

export const colors = {
  blue: 0x0000ff,
  darkGrey: 0x353535,
};
