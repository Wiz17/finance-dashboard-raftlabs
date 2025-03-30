export const GET_TRANSACTION_BY_USER_ID = `
query GetTransactionsWithCategoriesByUserId($user_id: UUID!) {
  transactionsCollection(filter: { user_id: { eq: $user_id } }) {
    edges {
      node {
        id
        amount
        description
        created_at
        user_id
        type
        categories {
          
          name
          
        }
      }
    }
  }
}
`;
export const DELETE_TRANSACTIONS=
`
mutation DeleteTransactions($id: UUID!) {
  deleteFromTransactionsCollection(
    filter: { id: { eq: $id } }
    
  ) {
    affectedCount
    records {
      id
      
    }
  }
}
`
export const UPDATE_TRANSACTIONS=
`
mutation UpdateTransactions($id: ID!, $amount: Float!) {
  updateTransactionsCollection(
    filter: { id: { eq: $id } } 
    set: { amount: $amount }  
  ) {
    affectedCount
    records {
      id
      amount  
    }
  }
}`

export const ADD_TRANSACTIONS=
`
mutation AddTransactions(
  $amount: String!
  $description: String!
  $created_at: Date
  $user_id: UUID!
  $type: String
  $category_id:UUID!
) {
  insertIntoTransactionsCollection(
    objects: [{
      amount: $amount
      description: $description
      created_at: $created_at
      user_id: $user_id
      type: $type
      category_id: $category_id
    }]
  ) {
    records {
      id
      amount
      description
      created_at
      user_id
      type
      categories{
        name
      }
    }
  }
}
`

export const ADD_SAVINGS_GOAL = `

mutation AddSavingsGoal(
  $name: String!
  $current_amount: String!
  $target_date: Date
  $target_amount: String
  $willing_to_add: String
  $category: String
  $user_id: UUID!
  $is_completed: Boolean = false
) {
  insertIntoSavingsCollection(
    objects: [{
      name: $name
      current_amount: $current_amount
      target_date: $target_date
      target_amount: $target_amount
      willing_to_add: $willing_to_add
      category: $category
      user_id: $user_id
      is_completed: $is_completed
    }]
  ) {
    records {
      id
      name
      current_amount
      target_amount
      willing_to_add
      target_date
      category
      is_completed
      created_at
    }
  }
}
`
export const GET_SAVINGS_GOAL=`
query GetSavingsByUserId($user_id: UUID!) {
  savingsCollection(filter: { user_id: { eq: $user_id } }) {
    edges {
      node {
        id
        created_at
        name
        current_amount
        target_amount
        willing_to_add
        target_date
        category
        is_completed
      }
    }
  }
}
`

export const DELETE_SAVINGS_GOAL = `
  mutation DeleteSavingsGoal($id: uuid!) {
    deleteFromSavingsCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;

export const UPDATE_SAVINGS_GOAL=

`mutation UpdateSavingsGoals($id: ID!, $amount: Float!) {
  updateSavingsCollection(
    filter: { id: { eq: $id } } 
    set: { current_amount: $amount }  
  ) {
    affectedCount
    records {
      id
      current_amount  
    }
  }
}`


export const GET_CATEGORIES=
`
query GetCategories {
  categoriesCollection {
    edges {
      node {
        id
        name
        type
      }
    }
  }
}
`

//create mutation queries for create , upadte and delete savings.