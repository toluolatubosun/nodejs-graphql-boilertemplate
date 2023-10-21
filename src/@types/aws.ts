interface AWSTemplateEmailData {
    template: string;
    templateData: Object;
}

interface HTMLEmailData {
    html: string;
    subject: string;
}

interface AWSTemplateBulkEmailReceiverData {
    data: Object;
    email: string;
}

interface AWSUploadUrlData {
    folder: string;
    contentType: string;
    fileExtension?: string;
}

interface AWSGenerateUploadUrlArgs {
    input: AWSUploadUrlData;
    access?: "private" | "public";
}

interface AWSUploadUrlPayload {
    signedUrl: string;
    publicUrl: string;
}
