/**
 * @description
 * A BaM Xtra component extending BaM generic component.
 * It has one unique purpose: have a top content where the actual content 
 * of the component is put and a bottom content with an apply button
 * to apply the model specification.
 * 
 * @author Ivan Horner
 * 
 * @todo Is this component useful? A key feature is the apply button
 *       that need to have a callback associated with to configure the other
 *       downstream component (i.e. priors, calibration data, ...)
 */
class bamXtra extends bamComponent {
    constructor() {
        super();

        this.modelid;

        this.dom_content_top = document.createElement("div");
        this.dom_content_top.id = "bam-xtra-content-top";
        this.dom_content_bottom = document.createElement("div")
        this.dom_content_bottom.id = "bam-xtra-content-bottom";

        this.dom_apply_button = document.createElement("button");
        this.dom_apply_button.id = "bam-xtra-applybutton";
        bamI.set(this.dom_apply_button).key("xtra_applybtn").text().apply();

        this.dom_content_bottom.appendChild(this.dom_apply_button);

        this.dom_content.classList.add("bam-xtra-content")
        this.dom_content.appendChild(this.dom_content_top);
        this.dom_content.appendChild(this.dom_content_bottom);

    }
}