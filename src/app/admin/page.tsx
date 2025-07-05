import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { Package, Tags, DollarSign, AlertTriangle } from 'lucide-react'

async function getDashboardStats() {
  try {
    const [products, categories, lowStockProducts] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.product.count({
        where: { stock: { lt: 5 } }
      })
    ])

    const totalValue = await db.product.aggregate({
      _sum: { price: true },
      where: { isActive: true }
    })

    return {
      totalProducts: products,
      totalCategories: categories,
      lowStockItems: lowStockProducts,
      totalValue: totalValue._sum.price || 0
    }
  } catch (error) {
    console.error('Database connection error:', error)
    // Return mock data when database is unavailable
    return {
      totalProducts: 0,
      totalCategories: 0,
      lowStockItems: 0,
      totalValue: 0
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your admin dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items with stock &lt; 5
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Manage your thrift store inventory, categories, and business information from this dashboard.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Quick Actions</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add new products to your inventory</li>
                  <li>• Create and manage product categories</li>
                  <li>• Update your business information</li>
                  <li>• Manage contact details</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Getting Started</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Navigate using the sidebar menu</li>
                  <li>• Check the Products section to manage inventory</li>
                  <li>• Review low stock items regularly</li>
                  <li>• Keep your business info up to date</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 