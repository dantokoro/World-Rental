<?php
namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\Category;
use App\Models\Question;
use App\Models\Answer;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Get's a Product by it's ID
     *
     * @param int
     * @return collection
     */
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
        return Product::all();
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