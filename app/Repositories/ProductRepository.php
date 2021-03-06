<?php
namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\Category;
use App\Models\Question;
use App\Models\Answer;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\DB;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Get's a Product by it's ID
     *
     * @param int
     * @return collection
     */
    public function adminSellingProducts($pageSize)
    {
        $products = Product::where('sold', 0)->orderBy('created_at', 'DESC')->paginate($pageSize);
        $products->makeVisible(['location']);
        $products->load('productMedias');  
        return response()->json($products);
    }

    public function adminSoldProducts($pageSize)
    {
        $products = Product::where('sold', 1)->orderBy('created_at', 'DESC')->paginate($pageSize);
        $products->makeVisible(['location']);
        $products->load('productMedias');  
        return response()->json($products);
    }

    public function get($product_id)
    {
        return Product::find($product_id);
    }

    /**
     * Get's all Products.
     *
     * @return mixed
     */
    public function all()
    {
        return Product::where('sold', 0)->orderBy('created_at', 'DESC')->paginate(2);
    }

    /**
     * Deletes a Product.
     *
     * @param int
     */
    public function delete($product_id)
    {
        $questions = Question::where('product_id', $product_id);
        $question_ids = $questions->pluck('id');

        Answer::whereIn('question_id', $question_ids)->delete();
        ProductMedia::where('product_id', $product_id)->delete();

        $questions->delete();
        $product = Product::destroy($product_id);

        return response()->json($product_id);
    }

    /**
     * Updates a Product.
     *
     * @param int
     * @param array
     */
    public function update($product_id, array $product_data)
    {
        Product::find($product_id)->update($product_data);
    }
}