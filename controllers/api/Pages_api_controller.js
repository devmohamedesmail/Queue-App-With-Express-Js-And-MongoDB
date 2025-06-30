import connectDB from "../../config/db.js"
import Page from "../../models/Page.js"





export const add_new_page = async (req, res) => {
    try {
        await connectDB();

        const { title_en, title_ar, content_en, content_ar } = req.body;

        //   create new page
        const newPage = new Page({
            title_en,
            title_ar,
            content_en,
            content_ar,
        });

        await newPage.save();

        return res.status(201).json({
            status: 201,
            message: "Page created successfully",
            data: newPage,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong while creating the page",
            error: error.message,
        });
    }
}







export const fetch_pages = async (req, res) => {
    try {
        await connectDB()
        const pages = await Page.find();
        return res.json({
            status: 200,
            data: pages,
            message: "success"
        })
    } catch (error) {
        return res.json({
            status: 404,
            error: error.message,
            message: "Error"
        })
    }
}




// *************** update page
export const update_page = async (req, res) => {
    try {
        await connectDB();

        const { pageId } = req.params;
        const { title_en, title_ar, content_en, content_ar } = req.body;

        // التحقق من صحة ObjectId
        if (!mongoose.Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid page ID format",
            });
        }

        // إيجاد الصفحة
        const page = await Page.findById(pageId);
        if (!page) {
            return res.status(404).json({
                status: 404,
                message: `Page with ID ${pageId} not found`,
            });
        }

        // تحديث القيم إن وُجدت
        if (title_en !== undefined) page.title_en = title_en;
        if (title_ar !== undefined) page.title_ar = title_ar;
        if (content_en !== undefined) page.content_en = content_en;
        if (content_ar !== undefined) page.content_ar = content_ar;

        await page.save();

        return res.status(200).json({
            status: 200,
            message: `Page updated successfully`,
            data: page,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

// حذف صفحة
export const delete_page = async (req, res) => {
    try {
        await connectDB();
        const { pageId } = req.params;
        const deleted = await Page.findByIdAndDelete(pageId);

        if (!deleted) {
            return res.status(404).json({ status: 404, message: "Page not found" });
        }

        return res.json({
            status: 200,
            message: "Page deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};
