interface AWSTemplateEmailData {
    template: string;
    templateData: Record<string, unknown>;
}

interface HTMLEmailData {
    html: string;
    subject: string;
}

interface AWSTemplateBulkEmailReceiverData {
    email: string;
    data: Record<string, unknown>;
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
